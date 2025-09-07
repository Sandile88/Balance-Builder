import '../styles/globals.css'
import { MiniKitContextProvider } from '../providers/MinikitProvider'

export const metadata = {
  title: 'Balance Builder - Precision Stacking Game',
  description: 'Stack falling blocks with precision to build the tallest stable tower',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MiniKitContextProvider>
          {children}
        </MiniKitContextProvider>
      </body>
    </html>
  )
}