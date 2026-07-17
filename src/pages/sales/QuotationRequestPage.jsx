import { Navigate } from "react-router-dom";

/** Hub báo giá Sales (2 tab: yêu cầu + bản báo giá) */
export { default } from "./SalesQuotationsPage";

/** Route cũ /sales/quotation-approval → tab bản báo giá */
export function QuotationApprovalRedirect() {
  return <Navigate to="/sales/quotations?tab=quotes" replace />;
}
