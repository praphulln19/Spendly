import { ImageResponse } from 'next/og';

/*
 * The social card, generated at build time. A link to Spendly pasted into
 * WhatsApp, Slack, X or a Google Discover panel had nothing to unfurl before
 * this: no image tag meant a bare grey box, which is the difference between a
 * link that gets clicked and one that does not.
 */
export const alt = 'Spendly - know what you can spend today';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#000000',
          padding: '72px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              backgroundColor: '#ffffff',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '38px',
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div style={{ fontSize: '38px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Spendly
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: '78px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              maxWidth: '900px',
            }}
          >
            Know what you can spend today.
          </div>
          <div
            style={{
              marginTop: '28px',
              fontSize: '30px',
              color: '#8e8e93',
              maxWidth: '880px',
              lineHeight: 1.35,
            }}
          >
            One daily number from your budget, recalculated every morning.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              backgroundColor: '#1c1c1e',
              color: '#8e8e93',
              fontSize: '22px',
            }}
          >
            Free
          </div>
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              backgroundColor: '#1c1c1e',
              color: '#8e8e93',
              fontSize: '22px',
            }}
          >
            Works offline
          </div>
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              backgroundColor: '#1c1c1e',
              color: '#8e8e93',
              fontSize: '22px',
            }}
          >
            Install as an app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
