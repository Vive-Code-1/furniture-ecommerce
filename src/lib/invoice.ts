interface InvoiceOrder {
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  shipping_address: string | null;
  order_date: string;
  total_amount: number;
  status: string;
}

interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

export const generateInvoiceHTML = (order: InvoiceOrder, items: InvoiceItem[]): string => {
  const date = new Date(order.order_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemsHTML = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${item.product_name}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">$${Number(item.unit_price).toFixed(2)}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * Number(item.unit_price)).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${order.order_number}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .logo { font-size: 24px; font-weight: bold; }
        .invoice-title { font-size: 28px; color: #666; text-transform: uppercase; letter-spacing: 2px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
        .info-block h4 { margin: 0 0 8px; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .info-block p { margin: 4px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 12px 0; border-bottom: 2px solid #333; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .total-row { font-weight: bold; font-size: 18px; }
        .footer { margin-top: 60px; text-align: center; color: #999; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">● Modulive</div>
        <div class="invoice-title">Invoice</div>
      </div>
      <div class="info-grid">
        <div class="info-block">
          <h4>Bill To</h4>
          <p><strong>${order.customer_name}</strong></p>
          ${order.customer_email ? `<p>${order.customer_email}</p>` : ""}
          ${order.shipping_address ? `<p>${order.shipping_address}</p>` : ""}
        </div>
        <div class="info-block" style="text-align: right;">
          <h4>Invoice Details</h4>
          <p><strong>Order:</strong> ${order.order_number}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
          <tr class="total-row">
            <td colspan="3" style="padding: 20px 0; text-align: right;">Grand Total</td>
            <td style="padding: 20px 0; text-align: right;">$${Number(order.total_amount).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Modulive — Premium Modern Furniture</p>
      </div>
    </body>
    </html>
  `;
};

export const openInvoice = (html: string) => {
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
};
