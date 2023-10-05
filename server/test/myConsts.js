const usersTableName = 'users';
const uuidColName = 'uuid';
const emailColName = 'email';
const googleColName = 'google';
const users_uuid_index_name = 'users_uuid_idx';
const users_email_index_name = 'users_email_idx';
const usersKeyColName = uuidColName;

const productsTableName = 'products';
const nameColName = 'name';
const products_uuid_index_name = 'products_uuid_idx';
const products_name_index_name = 'products_name_idx';
const productsKeyColName = uuidColName;

const cartsTableName = 'carts';
const userUuidfkColName = 'user_uuid';
const cartsUserUuidForeignKeyName = cartsTableName + '_' + userUuidfkColName + '_fkey';
const cartsKeyColName = uuidColName;

const cartItemsTableName = 'cart_items';
const cartUuidFkColName = 'cart_uuid';
const cartItemsCartsForeignKeyName = cartItemsTableName + '_' + cartUuidFkColName + '_fkey';
const productsUuidFkColName = 'product_uuid';
const cartItemsProductUuidForeignKeyName = cartItemsTableName + '_' + productsUuidFkColName + '_fkey';

const ordersTableName = 'orders';
const ordersUserUuidForeignKeyName = ordersTableName + '_' + userUuidfkColName + '_fkey';
const ordersKeyColName = uuidColName;

const orderItemsTableName = 'order_items';
const orderUuidFkColName = 'order_uuid';
const ordersUuidForeignKeyName = orderItemsTableName + '_' + orderUuidFkColName + '_fkey';
const ordersProductsUuidForeignKeyName = orderItemsTableName + '_' + productsUuidFkColName + '_fkey';

module.exports = {
  usersTableName,
  uuidColName,
  emailColName,
  googleColName,
  users_uuid_index_name,
  users_email_index_name,
  usersKeyColName,
  productsTableName,
  nameColName,
  products_uuid_index_name,
  products_name_index_name,
  productsKeyColName,
  cartsTableName,
  userUuidfkColName,
  cartsUserUuidForeignKeyName,
  cartsKeyColName,
  cartItemsTableName,
  cartItemsCartsForeignKeyName,
  productsUuidFkColName,
  cartItemsProductUuidForeignKeyName,
  ordersTableName,
  ordersUserUuidForeignKeyName,
  ordersKeyColName,
  orderItemsTableName,
  orderUuidFkColName,
  ordersUuidForeignKeyName,
  ordersProductsUuidForeignKeyName
};