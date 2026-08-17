import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/vendorShopProfile.css'
import './styles/vendorProductListing.css'
import './styles/adminApproval.css'
import './styles/adminProductManagement.css'
import './styles/adminVendorManagement.css'
import './styles/adminReporting.css'
import './styles/adminResponsive.css'
import './styles/shopCatalog.css'
import './styles/vendorPortalV2.css'
import App from './App.jsx'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)

