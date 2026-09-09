import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export type ReceiptItem = {
  product_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type ReceiptData = {
  orderNumber: number;
  createdAt: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postalCode: string;
  items: ReceiptItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
};

type Props = {
  order: ReceiptData;
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#222222",
  },

  header: {
    marginBottom: 20,
  },

  brand: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 14,
  },

  section: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingBottom: 6,
    marginBottom: 6,
  },

  itemRow: {
    flexDirection: "row",
    marginBottom: 7,
  },

  itemName: {
    width: "46%",
  },

  itemQty: {
    width: "14%",
    textAlign: "center",
  },

  itemPrice: {
    width: "20%",
    textAlign: "right",
  },

  itemTotal: {
    width: "20%",
    textAlign: "right",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
    paddingTop: 8,
    marginTop: 5,
  },

  grandTotal: {
    fontSize: 13,
    fontWeight: "bold",
  },

  address: {
    lineHeight: 1.5,
  },

  footer: {
    marginTop: 30,
    fontSize: 9,
    color: "#666666",
    textAlign: "center",
  },
});

export default function ReceiptDocument({ order }: Props) {
  const addressParts = [
    order.addressLine1,
    order.addressLine2,
    order.landmark,
    `${order.city}, ${order.state} - ${order.postalCode}`,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>B-Fresh</Text>

          <Text>
            Fresh food & dairy delivered to your door
          </Text>
        </View>

        <Text style={styles.title}>
          Order Receipt #{order.orderNumber}
        </Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Order Date</Text>

            <Text>
              {new Date(order.createdAt).toLocaleString("en-IN")}
            </Text>
          </View>

          <View style={styles.row}>
            <Text>Order Status</Text>

            <Text>
              {order.status.replaceAll("_", " ")}
            </Text>
          </View>

          <View style={styles.row}>
            <Text>Payment</Text>

            <Text>
              {order.paymentMethod === "cod"
                ? "Cash on Delivery"
                : order.paymentMethod}
            </Text>
          </View>

          <View style={styles.row}>
            <Text>Payment Status</Text>

            <Text>{order.paymentStatus}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Customer
          </Text>

          <Text>{order.customerName}</Text>
          <Text>{order.phone}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Delivery Address
          </Text>

          <Text style={styles.address}>
            {addressParts.join("\n")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Order Items
          </Text>

          <View style={styles.tableHeader}>
            <Text style={styles.itemName}>
              Product
            </Text>

            <Text style={styles.itemQty}>
              Qty
            </Text>

            <Text style={styles.itemPrice}>
              Price
            </Text>

            <Text style={styles.itemTotal}>
              Total
            </Text>
          </View>

          {order.items.map((item, index) => (
            <View
              key={`${item.product_name}-${index}`}
              style={styles.itemRow}
            >
              <Text style={styles.itemName}>
                {item.product_name}
                {item.unit ? ` (${item.unit})` : ""}
              </Text>

              <Text style={styles.itemQty}>
                {item.quantity}
              </Text>

              <Text style={styles.itemPrice}>
                Rs. {Number(item.unit_price).toFixed(2)}
              </Text>

              <Text style={styles.itemTotal}>
                Rs. {Number(item.total_price).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.row}>
            <Text>Subtotal</Text>

            <Text>
              Rs. {Number(order.subtotal).toFixed(2)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text>Delivery</Text>

            <Text>
              Rs. {Number(order.deliveryFee).toFixed(2)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text>Discount</Text>

            <Text>
              Rs. {Number(order.discountAmount).toFixed(2)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.grandTotal}>
              Total
            </Text>

            <Text style={styles.grandTotal}>
              Rs. {Number(order.totalAmount).toFixed(2)}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Thank you for choosing B-Fresh.
        </Text>
      </Page>
    </Document>
  );
}