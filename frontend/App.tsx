import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Alert, FlatList, Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { DarkTheme, DefaultTheme, NavigationContainer, type NavigatorScreenParams } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { Session } from '@supabase/supabase-js'
import { StatusBar } from 'expo-status-bar'
import { makeRedirectUri } from 'expo-auth-session'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import * as WebBrowser from 'expo-web-browser'
import { supabase } from './src/lib/supabase'
import { ExpenseProvider, useExpenseStore } from './src/hooks/useExpenses'
import { expenseCategories, type Expense, type ExpenseCategory, type ExpenseType, type NewExpense } from './src/types/expense'

type TabParams = { Dashboard: undefined; Expenses: undefined }
type RootParams = { Tabs: NavigatorScreenParams<TabParams>; AddExpense: undefined }
const Tabs = createBottomTabNavigator<TabParams>()
const Stack = createNativeStackNavigator<RootParams>()

WebBrowser.maybeCompleteAuthSession()

const colors = { blue: '#2563eb', ink: '#0f172a', muted: '#64748b', border: '#e2e8f0', page: '#f8fafc', white: '#ffffff', green: '#16a34a', orange: '#ea580c' }
const categoryIcons: Record<ExpenseCategory, keyof typeof Ionicons.glyphMap> = { Food: 'restaurant-outline', Transport: 'bus-outline', Education: 'book-outline', 'Rent/Hostel': 'home-outline', 'Mobile/Internet': 'phone-portrait-outline', Shopping: 'bag-outline', Entertainment: 'film-outline', Personal: 'person-outline', Subscriptions: 'repeat-outline', Other: 'ellipsis-horizontal-circle-outline' }
const money = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
const dateLabel = (date: string) => {
  const [year, month, day] = date.slice(0, 10).split('-')
  return `${day}-${month}-${year}`
}
const dateToDisplay = (date: string) => {
  const [year, month, day] = date.split('-')
  return `${day}-${month}-${year}`
}
const displayToDate = (date: string) => {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(date)
  if (!match) return null
  const [, day, month, year] = match
  const parsed = new Date(`${year}-${month}-${day}T00:00:00`)
  return Number.isNaN(parsed.getTime()) || parsed.getDate() !== Number(day) || parsed.getMonth() !== Number(month) - 1 ? null : `${year}-${month}-${day}`
}

type ThemePalette = { page: string; surface: string; ink: string; muted: string; border: string; input: string; soft: string }
type ThemeState = { dark: boolean; palette: ThemePalette; toggle: () => void }
const lightPalette: ThemePalette = { page: colors.page, surface: colors.white, ink: colors.ink, muted: colors.muted, border: colors.border, input: '#cbd5e1', soft: '#eff6ff' }
const darkPalette: ThemePalette = { page: '#0f172a', surface: '#172033', ink: '#f8fafc', muted: '#94a3b8', border: '#334155', input: '#475569', soft: '#1e3a5f' }
const ThemeContext = createContext<ThemeState>({ dark: false, palette: lightPalette, toggle: () => undefined })
const useTheme = () => useContext(ThemeContext)

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => subscription.subscription.unsubscribe()
  }, [])

  if (!ready) return <LoadingScreen label="Opening Spendly..." />
  if (!session) return <AuthScreen />
  return <AppNavigator />
}

function AppNavigator() {
  const [dark, setDark] = useState(false)
  const palette = dark ? darkPalette : lightPalette
  const theme = { dark, palette, toggle: () => setDark(current => !current) }
  return <ThemeContext.Provider value={theme}><ExpenseProvider><NavigationContainer theme={{ ...(dark ? DarkTheme : DefaultTheme), colors: { ...(dark ? DarkTheme : DefaultTheme).colors, primary: colors.blue, background: dark ? '#0f172a' : colors.page, card: dark ? '#172033' : colors.white, text: dark ? '#f8fafc' : colors.ink, border: dark ? '#334155' : colors.border, notification: colors.blue } }}><StatusBar style={dark ? 'light' : 'dark'} /><Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: dark ? '#0f172a' : colors.page } }}><Stack.Screen name="Tabs" options={{ headerShown: false }}>{() => <TabNavigator />}</Stack.Screen><Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ presentation: 'modal', title: 'Add expense' }} /></Stack.Navigator></NavigationContainer></ExpenseProvider></ThemeContext.Provider>
}

function TabNavigator() {
  const { dark } = useTheme()
  return <Tabs.Navigator screenOptions={({ route }) => ({ headerStyle: { backgroundColor: dark ? '#172033' : colors.white }, headerShadowVisible: false, headerTitle: () => <Brand />, headerRight: () => <HeaderActions />, tabBarActiveTintColor: colors.blue, tabBarInactiveTintColor: dark ? '#94a3b8' : '#94a3b8', tabBarStyle: { backgroundColor: dark ? '#172033' : colors.white, borderTopColor: dark ? '#334155' : colors.border, height: 62 }, tabBarIcon: ({ color, size }) => <Ionicons name={route.name === 'Dashboard' ? 'grid-outline' : 'receipt-outline'} color={color} size={size} /> })}><Tabs.Screen name="Dashboard" component={DashboardScreen} /><Tabs.Screen name="Expenses" component={ExpensesScreen} /></Tabs.Navigator>
}

function DashboardScreen({ navigation }: any) {
  const { palette } = useTheme(); const { expenses, loading, error, refresh, remove } = useExpenseStore()
  const totals = useMemo(() => totalsFor(expenses), [expenses])
  const categories = useMemo(() => categoryTotals(expenses), [expenses])
  const confirmDelete = (expense: Expense) => confirmExpenseDeletion(expense, remove)
  return <SafeAreaView style={[styles.safe, { backgroundColor: palette.page }]}><ScrollView contentContainerStyle={[styles.screen, { backgroundColor: palette.page }]}><ScreenHeader eyebrow="SPENDING OVERVIEW" title="Your month at a glance" onAdd={() => navigation.navigate('AddExpense')} /><LoadError error={error} onRetry={refresh} />
    {loading ? <LoadingScreen label="Loading expenses..." /> : <><View style={styles.summaryGrid}><Summary label="Total expenses" amount={money(totals.total)} icon="wallet-outline" tone="#dbeafe" /><Summary label="Needs" amount={money(totals.needs)} icon="checkmark-circle-outline" tone="#dcfce7" /><Summary label="Wants" amount={money(totals.wants)} icon="heart-outline" tone="#ffedd5" /></View>
    <Section title="Spending by category">{categories.length ? categories.slice(0, 5).map(({ category, amount }) => <CategoryRow key={category} category={category} amount={amount} maximum={categories[0].amount} />) : <EmptyCompact label="No spending recorded yet." />}</Section>
    <Section title="Need vs want"><View style={styles.breakdown}><View style={[styles.ring, { borderRightColor: totals.needs >= totals.wants ? colors.green : colors.orange, borderTopColor: totals.needs >= totals.wants ? colors.green : colors.orange }]}><Text style={styles.ringAmount}>{money(totals.total)}</Text><Text style={styles.ringLabel}>Total</Text></View><View style={styles.legend}><Legend label="Needs" amount={totals.needs} color={colors.green} /><Legend label="Wants" amount={totals.wants} color={colors.orange} /></View></View></Section>
    <Section title="Recent expenses" action="View all" onAction={() => navigation.navigate('Expenses')}><ExpenseItems expenses={expenses.slice(0, 5)} onDelete={confirmDelete} /></Section></>}</ScrollView></SafeAreaView>
}

function ExpensesScreen({ navigation }: any) {
  const { palette } = useTheme(); const { expenses, loading, error, refresh, remove } = useExpenseStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ExpenseCategory | 'All'>('All')
  const visible = expenses.filter(expense => (category === 'All' || expense.category === category) && `${expense.description} ${expense.category}`.toLowerCase().includes(query.toLowerCase()))
  const confirmDelete = (expense: Expense) => confirmExpenseDeletion(expense, remove)
  return <SafeAreaView style={[styles.safe, { backgroundColor: palette.page }]}><View style={[styles.screen, { backgroundColor: palette.page }]}><ScreenHeader eyebrow="ALL TRANSACTIONS" title="Your expenses" onAdd={() => navigation.navigate('AddExpense')} /><TextInput value={query} onChangeText={setQuery} placeholder="Search expenses" placeholderTextColor={palette.muted} style={[styles.search, { backgroundColor: palette.surface, borderColor: palette.input, color: palette.ink }]} /><ScrollView horizontal style={styles.chipsScroller} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{(['All', ...expenseCategories] as const).map(value => <Pressable key={value} onPress={() => setCategory(value)} style={[styles.chip, { backgroundColor: palette.surface, borderColor: palette.input }, category === value && [styles.chipActive, { backgroundColor: palette.soft }]]}><Text style={[styles.chipText, { color: palette.muted }, category === value && styles.chipTextActive]}>{value}</Text></Pressable>)}</ScrollView><LoadError error={error} onRetry={refresh} />
  {loading ? <LoadingScreen label="Loading expenses..." /> : visible.length ? <FlatList data={visible} keyExtractor={item => item.id} renderItem={({ item }) => <ExpenseRow expense={item} onDelete={() => confirmDelete(item)} />} contentContainerStyle={styles.list} /> : <EmptyState onAdd={() => navigation.navigate('AddExpense')} />}</View></SafeAreaView>
}

function AddExpenseScreen({ navigation }: any) {
  const { add } = useExpenseStore()
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); const [category, setCategory] = useState<ExpenseCategory>('Food'); const [description, setDescription] = useState(''); const [amount, setAmount] = useState(''); const [type, setType] = useState<ExpenseType>('Need'); const [saving, setSaving] = useState(false)
  const save = async () => {
    const numericAmount = Number(amount)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) { Alert.alert('Check your details', 'Choose a date, description, and amount greater than zero.'); return }
    setSaving(true); try { await add({ date, category, description: description.trim(), amount: numericAmount, type } satisfies NewExpense); navigation.goBack() } catch (cause) { Alert.alert('Unable to save', cause instanceof Error ? cause.message : 'Try again.') } finally { setSaving(false) }
  }
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}><ScrollView contentContainerStyle={styles.form}><DateField value={date} onChange={setDate} /><Text style={styles.fieldLabel}>Category</Text><ScrollView horizontal style={styles.chipsScroller} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{expenseCategories.map(value => <Pressable key={value} onPress={() => setCategory(value)} style={[styles.chip, category === value && styles.chipActive]}><Text style={[styles.chipText, category === value && styles.chipTextActive]}>{value}</Text></Pressable>)}</ScrollView><Field label="Description" value={description} onChangeText={setDescription} placeholder="What did you spend on?" /><Field label="Amount (INR)" value={amount} onChangeText={setAmount} placeholder="0" keyboardType="decimal-pad" /><Text style={styles.fieldLabel}>Expense type</Text><View style={styles.typeRow}>{(['Need', 'Want'] as const).map(value => <Pressable key={value} onPress={() => setType(value)} style={[styles.typeButton, type === value && styles.typeButtonSelected]}><Text style={[styles.typeText, type === value && styles.typeTextSelected]}>{value}</Text></Pressable>)}</View><Pressable onPress={() => void save()} disabled={saving} style={[styles.primary, saving && styles.disabled]}><Text style={styles.primaryText}>{saving ? 'Saving...' : 'Save expense'}</Text></Pressable></ScrollView></KeyboardAvoidingView>
}

function AuthScreen() {
  const [loading, setLoading] = useState(false)
  const redirectTo = makeRedirectUri({ scheme: 'spendly', path: 'auth/callback' })

  const signInWithProvider = async (provider: 'google' | 'github') => {
    setLoading(true)
    try {
      if (Platform.OS === 'web') {
        const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } })
        if (error) throw error
        return
      }
      const { data, error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo, skipBrowserRedirect: true } })
      if (error) throw error
      if (!data.url) throw new Error('The sign-in provider did not return an authorization URL.')
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
      if (result.type !== 'success') return
      const { params, errorCode } = QueryParams.getQueryParams(result.url)
      if (errorCode) throw new Error(errorCode)
      if (!params.access_token || !params.refresh_token) throw new Error('The sign-in response did not include a session.')
      const { error: sessionError } = await supabase.auth.setSession({ access_token: params.access_token, refresh_token: params.refresh_token })
      if (sessionError) throw sessionError
    } catch (cause) { Alert.alert('Social sign-in failed', cause instanceof Error ? cause.message : 'Check the provider setup and try again.') }
    finally { setLoading(false) }
  }

  return <SafeAreaView style={styles.auth}><Image source={require('./assets/spendly-logo.png')} style={styles.authLogo} resizeMode="contain" accessibilityLabel="Spendly" /><Text style={styles.authTitle}>Welcome</Text><Text style={styles.authSubhead}>Choose an account to continue.</Text><View style={styles.authForm}><SocialButton label="Continue with Google" icon="logo-google" onPress={() => void signInWithProvider('google')} disabled={loading} /><SocialButton label="Continue with GitHub" icon="logo-github" onPress={() => void signInWithProvider('github')} disabled={loading} /></View></SafeAreaView>
}

function SocialButton({ label, icon, onPress, disabled }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; disabled: boolean }) { return <Pressable onPress={onPress} disabled={disabled} style={[styles.socialButton, disabled && styles.disabled]}><Ionicons name={icon} size={19} color={colors.ink} /><Text style={styles.socialText}>{label}</Text></Pressable> }

function Brand() { const { palette } = useTheme(); return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Image source={require('./assets/spendly-logo.png')} style={{ width: 32, height: 32 }} resizeMode="contain" accessibilityLabel="Spendly logo" /><Text style={{ color: palette.ink, fontSize: 19, fontWeight: '800' }}>Spendly</Text></View> }
function HeaderActions() { const { dark, palette, toggle } = useTheme(); const [open, setOpen] = useState(false); const logout = async () => { setOpen(false); const { error } = await supabase.auth.signOut(); if (error) Alert.alert('Unable to log out', error.message) }; return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 14, position: 'relative' }}><Pressable accessibilityLabel="Toggle dark mode" onPress={toggle} style={{ padding: 6 }}><Ionicons name={dark ? 'sunny-outline' : 'moon-outline'} size={20} color={palette.ink} /></Pressable><Pressable accessibilityLabel="Profile and account options" onPress={() => setOpen(value => !value)} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.border, borderRadius: 16 }}><Ionicons name="person-outline" size={20} color={palette.ink} /></Pressable>{open && <View style={{ position: 'absolute', right: 0, top: 42, width: 118, backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: 8, padding: 5, zIndex: 20, elevation: 8 }}><Pressable onPress={() => void logout()} style={{ flexDirection: 'row', gap: 7, alignItems: 'center', padding: 9 }}><Ionicons name="log-out-outline" size={18} color="#dc2626" /><Text style={{ color: '#dc2626', fontWeight: '700' }}>Log out</Text></Pressable></View>}</View> }

function ScreenHeader({ eyebrow, title, onAdd }: { eyebrow: string; title: string; onAdd: () => void }) { const { palette } = useTheme(); return <View style={styles.header}><View><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={[styles.title, { color: palette.ink }]}>{title}</Text></View><Pressable accessibilityLabel="Add expense" onPress={onAdd} style={styles.iconButton}><Ionicons name="add" size={24} color={colors.white} /></Pressable></View> }
function Section({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: React.ReactNode }) { const { palette } = useTheme(); return <View style={[styles.section, { backgroundColor: palette.surface, borderColor: palette.border }]}><View style={styles.sectionTitle}><Text style={[styles.sectionHeading, { color: palette.ink }]}>{title}</Text>{action && <Pressable onPress={onAction}><Text style={styles.action}>{action}</Text></Pressable>}</View>{children}</View> }
function Summary({ label, amount, icon, tone }: { label: string; amount: string; icon: keyof typeof Ionicons.glyphMap; tone: string }) { const { palette } = useTheme(); return <View style={[styles.summary, { backgroundColor: palette.surface, borderColor: palette.border }]}><View style={[styles.summaryIcon, { backgroundColor: tone }]}><Ionicons name={icon} size={19} color={colors.blue} /></View><Text style={[styles.summaryLabel, { color: palette.muted }]}>{label}</Text><Text style={[styles.summaryAmount, { color: palette.ink }]}>{amount}</Text></View> }
function CategoryRow({ category, amount, maximum }: { category: ExpenseCategory; amount: number; maximum: number }) { const { palette } = useTheme(); return <View style={styles.categoryRow}><View style={styles.categoryLine}><View style={styles.categoryLeft}><Ionicons name={categoryIcons[category]} size={17} color={colors.blue} /><Text style={[styles.categoryName, { color: palette.ink }]}>{category}</Text></View><Text style={[styles.categoryAmount, { color: palette.ink }]}>{money(amount)}</Text></View><View style={[styles.progress, { backgroundColor: palette.soft }]}><View style={[styles.progressFill, { width: `${Math.max(8, amount / maximum * 100)}%` }]} /></View></View> }
function Legend({ label, amount, color }: { label: string; amount: number; color: string }) { const { palette } = useTheme(); return <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: color }]} /><Text style={[styles.legendText, { color: palette.muted }]}>{label}</Text><Text style={[styles.legendAmount, { color: palette.ink }]}>{money(amount)}</Text></View> }
function ExpenseItems({ expenses, onDelete }: { expenses: Expense[]; onDelete?: (expense: Expense) => void }) { return expenses.length ? <View>{expenses.map(expense => <ExpenseRow key={expense.id} expense={expense} onDelete={onDelete ? () => onDelete(expense) : undefined} />)}</View> : <EmptyCompact label="No expenses yet." /> }
function ExpenseRow({ expense, onDelete }: { expense: Expense; onDelete?: () => void }) { return <View style={styles.expense}><View style={styles.expenseIcon}><Ionicons name={categoryIcons[expense.category]} size={19} color={colors.blue} /></View><View style={styles.expenseCopy}><Text style={styles.expenseDescription} numberOfLines={1}>{expense.description}</Text><Text style={styles.expenseMeta}>{expense.category} · {dateLabel(expense.date)}</Text></View><View><Text style={[styles.badge, expense.type === 'Need' ? styles.need : styles.want]}>{expense.type}</Text><Text style={styles.expenseAmount}>{money(expense.amount)}</Text></View>{onDelete && <Pressable accessibilityLabel={`Delete ${expense.description}`} onPress={onDelete} hitSlop={8}><Ionicons name="trash-outline" size={19} color="#dc2626" /></Pressable>}</View> }
function confirmExpenseDeletion(expense: Expense, remove: (id: string) => Promise<void>) {
  const message = `${expense.description} will be permanently removed.`
  const deleteNow = () => void remove(expense.id).catch(cause => Alert.alert('Unable to delete', cause instanceof Error ? cause.message : 'Try again.'))
  if (Platform.OS === 'web') {
    if (window.confirm(`Delete expense?\n\n${message}`)) deleteNow()
    return
  }
  Alert.alert('Delete expense?', message, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: deleteNow }])
}
function DateField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState(dateToDisplay(value))
  const [month, setMonth] = useState(() => new Date(`${value}T00:00:00`))
  useEffect(() => setTyped(dateToDisplay(value)), [value])
  const commitTyped = () => { const parsed = displayToDate(typed); if (parsed) { onChange(parsed); setMonth(new Date(`${parsed}T00:00:00`)) } else setTyped(dateToDisplay(value)) }
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: firstDay + days }, (_, index) => index < firstDay ? null : index - firstDay + 1)
  const selected = (day: number) => `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const dayStyle = { width: '14.2857%' as const, height: 34, alignItems: 'center' as const, justifyContent: 'center' as const, borderRadius: 17 }
  return <View><Text style={styles.fieldLabel}>Date (DD-MM-YYYY)</Text><View style={{ flexDirection: 'row', gap: 8 }}><TextInput value={typed} onChangeText={setTyped} onBlur={commitTyped} placeholder="DD-MM-YYYY" placeholderTextColor="#94a3b8" keyboardType="numbers-and-punctuation" maxLength={10} style={[styles.input, { flex: 1 }]} /><Pressable accessibilityLabel="Choose expense date" onPress={() => setOpen(current => !current)} style={{ width: 46, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }}><Ionicons name="calendar-outline" size={21} color={colors.blue} /></Pressable></View>{open && <View style={{ marginTop: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, backgroundColor: colors.white }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}><Pressable accessibilityLabel="Previous month" onPress={() => setMonth(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))}><Ionicons name="chevron-back" size={20} color={colors.ink} /></Pressable><Text style={{ color: colors.ink, fontWeight: '700' }}>{month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</Text><Pressable accessibilityLabel="Next month" onPress={() => setMonth(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))}><Ionicons name="chevron-forward" size={20} color={colors.ink} /></Pressable></View><View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <Text key={`${day}-${index}`} style={{ width: '14.2857%', textAlign: 'center', color: colors.muted, fontSize: 12, paddingBottom: 5 }}>{day}</Text>)}{cells.map((day, index) => day ? <Pressable key={index} onPress={() => { onChange(selected(day)); setOpen(false) }} style={[dayStyle, value === selected(day) && { backgroundColor: colors.blue }]}><Text style={{ color: value === selected(day) ? colors.white : colors.ink, fontWeight: value === selected(day) ? '700' : '400' }}>{day}</Text></Pressable> : <View key={index} style={dayStyle} />)}</View></View>}</View>
}
function Field(props: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; keyboardType?: 'default' | 'email-address' | 'decimal-pad' | 'numbers-and-punctuation'; secureTextEntry?: boolean; autoCapitalize?: 'none' | 'sentences' }) { const { label, ...inputProps } = props; return <View><Text style={styles.fieldLabel}>{label}</Text><TextInput style={styles.input} placeholderTextColor="#94a3b8" {...inputProps} /></View> }
function LoadError({ error, onRetry }: { error: string | null; onRetry: () => void }) { return error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text><Pressable onPress={onRetry}><Text style={styles.action}>Retry</Text></Pressable></View> : null }
function LoadingScreen({ label }: { label: string }) { return <View style={styles.loading}><Text style={styles.muted}>{label}</Text></View> }
function EmptyCompact({ label }: { label: string }) { return <Text style={styles.muted}>{label}</Text> }
function EmptyState({ onAdd }: { onAdd: () => void }) { return <View style={styles.empty}><Ionicons name="receipt-outline" size={44} color="#93c5fd" /><Text style={styles.emptyTitle}>No expenses found</Text><Text style={styles.muted}>Start tracking your spending by adding an expense.</Text><Pressable onPress={onAdd} style={styles.primary}><Text style={styles.primaryText}>Add expense</Text></Pressable></View> }
function totalsFor(expenses: Expense[]) { return expenses.reduce((total, expense) => ({ total: total.total + expense.amount, needs: total.needs + (expense.type === 'Need' ? expense.amount : 0), wants: total.wants + (expense.type === 'Want' ? expense.amount : 0) }), { total: 0, needs: 0, wants: 0 }) }
function categoryTotals(expenses: Expense[]) { return Object.entries(expenses.reduce<Record<string, number>>((totals, expense) => ({ ...totals, [expense.category]: (totals[expense.category] ?? 0) + expense.amount }), {})).map(([category, amount]) => ({ category: category as ExpenseCategory, amount })).sort((a, b) => b.amount - a.amount) }

const styles = StyleSheet.create({ flex: { flex: 1 }, safe: { flex: 1, backgroundColor: colors.page }, screen: { flexGrow: 1, width: '100%', maxWidth: 1440, alignSelf: 'center', padding: 20, gap: 18 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }, eyebrow: { fontSize: 11, fontWeight: '700', color: colors.blue, letterSpacing: 0.8 }, title: { color: colors.ink, fontSize: 26, fontWeight: '700', marginTop: 4 }, iconButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blue, borderRadius: 8 }, summaryGrid: { flexDirection: 'row', gap: 10 }, summary: { flex: 1, minHeight: 140, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 16, borderRadius: 8 }, summaryIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }, summaryLabel: { color: colors.muted, fontSize: 11 }, summaryAmount: { color: colors.ink, fontSize: 16, fontWeight: '700', marginTop: 4 }, section: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 16, gap: 12 }, sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionHeading: { fontSize: 16, color: colors.ink, fontWeight: '700' }, action: { color: colors.blue, fontSize: 13, fontWeight: '600' }, categoryRow: { gap: 8 }, categoryLine: { flexDirection: 'row', justifyContent: 'space-between' }, categoryLeft: { flexDirection: 'row', gap: 8, alignItems: 'center' }, categoryName: { color: '#334155', fontSize: 13 }, categoryAmount: { color: colors.ink, fontWeight: '600', fontSize: 13 }, progress: { height: 6, backgroundColor: '#eff6ff', borderRadius: 3 }, progressFill: { height: 6, backgroundColor: colors.blue, borderRadius: 3 }, breakdown: { flexDirection: 'row', alignItems: 'center', gap: 28, justifyContent: 'flex-start', minHeight: 150 }, ring: { width: 124, height: 124, borderRadius: 62, borderWidth: 16, borderLeftColor: colors.orange, borderBottomColor: colors.orange, alignItems: 'center', justifyContent: 'center' }, ringAmount: { color: colors.ink, fontSize: 15, fontWeight: '700' }, ringLabel: { color: colors.muted, fontSize: 11, marginTop: 2 }, legend: { width: 190, gap: 12 }, legendRow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, dot: { width: 8, height: 8, borderRadius: 4 }, legendText: { flex: 1, color: colors.muted, fontSize: 13 }, legendAmount: { color: colors.ink, fontSize: 13, fontWeight: '600' }, expense: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.border }, expenseIcon: { width: 38, height: 38, borderRadius: 8, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }, expenseCopy: { flex: 1 }, expenseDescription: { color: colors.ink, fontSize: 14, fontWeight: '600' }, expenseMeta: { color: colors.muted, fontSize: 11, marginTop: 4 }, badge: { alignSelf: 'flex-end', fontSize: 10, fontWeight: '600', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' }, need: { color: '#166534', backgroundColor: '#dcfce7' }, want: { color: '#9a3412', backgroundColor: '#ffedd5' }, expenseAmount: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 4, textAlign: 'right' }, search: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: colors.white, color: colors.ink }, chipsScroller: { flexGrow: 0, height: 42 }, chips: { gap: 8, alignItems: 'center', paddingVertical: 2 }, chip: { height: 38, paddingHorizontal: 11, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: '#cbd5e1' }, chipActive: { backgroundColor: '#eff6ff', borderColor: colors.blue }, chipText: { color: colors.muted, fontSize: 12, fontWeight: '600' }, chipTextActive: { color: colors.blue }, list: { paddingBottom: 90 }, empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 36 }, emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '700' }, muted: { color: colors.muted, fontSize: 13, textAlign: 'center' }, primary: { backgroundColor: colors.blue, borderRadius: 8, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', marginTop: 8 }, primaryText: { color: colors.white, fontSize: 15, fontWeight: '700' }, secondary: { borderColor: '#cbd5e1', borderWidth: 1, borderRadius: 8, paddingVertical: 13, alignItems: 'center' }, secondaryText: { color: '#334155', fontSize: 15, fontWeight: '700' }, socialButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: colors.white, borderRadius: 8 }, socialText: { color: colors.ink, fontSize: 15, fontWeight: '700' }, divider: { flexDirection: 'row', alignItems: 'center', gap: 10 }, dividerLine: { flex: 1, height: 1, backgroundColor: colors.border }, dividerText: { color: colors.muted, fontSize: 12 }, disabled: { opacity: 0.6 }, form: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: 20, gap: 12 }, fieldLabel: { color: '#334155', fontSize: 13, fontWeight: '600', marginBottom: 7 }, input: { height: 46, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, color: colors.ink, backgroundColor: colors.white }, typeRow: { flexDirection: 'row', gap: 10 }, typeButton: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, alignItems: 'center', paddingVertical: 12 }, typeButtonSelected: { backgroundColor: '#eff6ff', borderColor: colors.blue }, typeText: { color: colors.muted, fontWeight: '600' }, typeTextSelected: { color: colors.blue }, auth: { flex: 1, backgroundColor: colors.page, justifyContent: 'center', alignItems: 'center', padding: 28 }, authLogo: { width: 240, height: 240, alignSelf: 'center', marginBottom: 4 }, authTitle: { width: '100%', maxWidth: 420, color: colors.ink, fontSize: 30, fontWeight: '700', textAlign: 'center' }, authSubhead: { width: '100%', maxWidth: 420, color: colors.muted, marginTop: 6, fontSize: 15, textAlign: 'center' }, authForm: { width: '100%', maxWidth: 420, gap: 15, marginTop: 28 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }, error: { padding: 12, backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', gap: 12 }, errorText: { flex: 1, color: '#b91c1c', fontSize: 12 } })
