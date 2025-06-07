import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import BudgetApp from './components/PersonalBudget'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BudgetApp></BudgetApp>
  </StrictMode>,
)
