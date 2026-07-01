import { CartItem } from '../../entities/cart-item.entity';
import { Category } from '../../entities/category.entity';
import { DeliveryInfo } from '../../entities/delivery-info.entity';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { PriceTag } from '../../entities/price-tag.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import { OrderStatus } from '../enums/order-status.enum';

const normalizeUrl = (value: string) => {
  if (!value) {
    return value;
  }

  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }

  const baseUrl = process.env.APP_BASE_URL ?? process.env.BASE_URL ?? '';

  if (!baseUrl) {
    return value;
  }

  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const normalizedPath = value.startsWith('/') ? value : `/${value}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
};

const calculateOrderTotals = (orderItems: OrderItem[], discount = 0) => {
  const subTotal = (orderItems ?? []).reduce(
    (sum, orderItem) => sum + Number(orderItem.priceAtTime ?? 0) * (orderItem.quantity ?? 1),
    0,
  );

  return {
    subTotal,
    total: Math.max(0, subTotal - Number(discount ?? 0)),
  };
};

const getOrderStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'Pending';
    case OrderStatus.CONFIRMED:
      return 'Confirmed';
    case OrderStatus.SHIPPED:
      return 'Shipped';
    case OrderStatus.DELIVERED:
      return 'Delivered';
    case OrderStatus.CANCELLED:
      return 'Cancelled';
    case OrderStatus.DELETED:
      return 'Deleted';
    default:
      return 'Unknown';
  }
};

export const mapCategory = (category: Category) => ({
  _id: category.id,
  name: category.name,
  image: normalizeUrl(category.image),
});

export const mapPriceTag = (priceTag: PriceTag) => ({
  _id: priceTag.id,
  name: priceTag.name,
  price: Number(priceTag.price),
  ...(priceTag.product ? { product: priceTag.product.id } : {}),
});

export const mapProduct = (product: Product) => ({
  _id: product.id,
  name: product.name,
  description: product.description,
  deliveryFee: Number(product.deliveryFee ?? 0),
  priceTags: (product.priceTags ?? []).map(mapPriceTag),
  categories: (product.categories ?? []).map(mapCategory),
  images: (product.images ?? []).map(normalizeUrl),
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

export const mapCartItem = (cartItem: CartItem) => ({
  _id: cartItem.id,
  product: mapProduct(cartItem.product),
  priceTag: mapPriceTag(cartItem.priceTag),
  quantity: cartItem.quantity,
});

export const mapDeliveryInfo = (deliveryInfo: DeliveryInfo) => ({
  _id: deliveryInfo.id,
  firstName: deliveryInfo.firstName,
  lastName: deliveryInfo.lastName,
  addressLineOne: deliveryInfo.addressLineOne,
  addressLineTwo: deliveryInfo.addressLineTwo,
  city: deliveryInfo.city,
  zipCode: deliveryInfo.zipCode,
  contactNumber: deliveryInfo.contactNumber,
});

export const mapOrderItem = (orderItem: OrderItem) => ({
  _id: orderItem.id,
  product: mapProduct(orderItem.product),
  priceTag: mapPriceTag(orderItem.priceTag),
  priceAtTime: Number(orderItem.priceAtTime),
  price: Number(orderItem.priceAtTime), // For dashboard compatibility
  quantity: orderItem.quantity,
});

export const mapOrder = (order: Order) => ({
  _id: order.id,
  orderItems: (order.orderItems ?? []).map(mapOrderItem),
  deliveryInfo: mapDeliveryInfo(order.deliveryInfo),
  discount: Number(order.discount),
  orderStatus: order.orderStatus,
  status: getOrderStatusLabel(order.status),
  paymentMethod: order.paymentMethod,
  ...calculateOrderTotals(order.orderItems ?? [], order.discount),
});

export const mapUser = (user: User) => ({
  _id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
});

export const mapAdminUser = (user: User) => ({
  ...mapUser(user),
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const mapAdminOrder = (order: Order) => ({
  _id: order.id,
  id: order.id,
  customer: order.user
    ? {
        id: order.user.id,
        name: `${order.user.firstName} ${order.user.lastName}`,
        email: order.user.email,
        phone: order.deliveryInfo?.contactNumber, // Assuming contact number is on delivery info
        joinedAt: order.user.createdAt,
      }
    : null,
  shippingAddress: order.deliveryInfo
    ? {
        name: `${order.deliveryInfo.firstName} ${order.deliveryInfo.lastName}`,
        phone: order.deliveryInfo.contactNumber,
        address: `${order.deliveryInfo.addressLineOne}${order.deliveryInfo.addressLineTwo ? `, ${order.deliveryInfo.addressLineTwo}` : ''}`,
        city: order.deliveryInfo.city,
        zipCode: order.deliveryInfo.zipCode,
      }
    : null,
  items: (order.orderItems ?? []).map((item) => ({
    id: item.id,
    product: {
      id: item.product.id,
      name: item.product.name,
      deliveryFee: Number(item.product.deliveryFee ?? 0),
      image: item.product.images?.[0],
      price: item.priceAtTime,
    },
    quantity: item.quantity,
    priceAtTime: item.priceAtTime,
    total: item.quantity * item.priceAtTime,
  })),
  payment: {
    method: order.paymentMethod,
    status: order.paymentStatus,
    id: order.paymentId,
  },
  summary: {
    subtotal: calculateOrderTotals(order.orderItems ?? []).subTotal,
    deliveryFee: (order.orderItems ?? []).reduce(
      (sum, item) => sum + Number(item.product?.deliveryFee ?? 0),
      0,
    ),
    total: calculateOrderTotals(order.orderItems ?? [], order.discount).total + (order.orderItems ?? []).reduce(
      (sum, item) => sum + Number(item.product?.deliveryFee ?? 0),
      0,
    ),
  },
  status: order.status,
  // Legacy status for old admin UI
  orderStatus: order.orderStatus,
  user: order.user ? mapUser(order.user) : null, // For backward compatibility
  orderItems: (order.orderItems ?? []).map(mapOrderItem), // For backward compatibility
  createdAt: order.createdAt,
});
