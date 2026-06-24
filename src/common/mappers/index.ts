import { CartItem } from '../../entities/cart-item.entity';
import { Category } from '../../entities/category.entity';
import { DeliveryInfo } from '../../entities/delivery-info.entity';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { PriceTag } from '../../entities/price-tag.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';

export const mapCategory = (category: Category) => ({
  _id: category.id,
  name: category.name,
  image: category.image,
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
  priceTags: (product.priceTags ?? []).map(mapPriceTag),
  categories: (product.categories ?? []).map(mapCategory),
  images: product.images ?? [],
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

export const mapCartItem = (cartItem: CartItem) => ({
  _id: cartItem.id,
  product: mapProduct(cartItem.product),
  priceTag: mapPriceTag(cartItem.priceTag),
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
  price: Number(orderItem.price),
  quantity: orderItem.quantity,
});

export const mapOrder = (order: Order) => ({
  _id: order.id,
  orderItems: (order.orderItems ?? []).map(mapOrderItem),
  deliveryInfo: mapDeliveryInfo(order.deliveryInfo),
  discount: Number(order.discount),
  orderStatus: order.orderStatus,
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
  user: order.user ? mapUser(order.user) : null,
  orderItems: (order.orderItems ?? []).map(mapOrderItem),
  deliveryInfo: mapDeliveryInfo(order.deliveryInfo),
  discount: Number(order.discount),
  orderStatus: order.orderStatus,
  createdAt: order.createdAt,
});
