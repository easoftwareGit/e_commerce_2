const usersTableName = 'users';
const guidColName = 'guid';
const emailColName = 'email';
const googleColName = 'google';
const users_guid_index_name = 'users_guid_idx';
const users_email_index_name = 'users_email_idx';
const usersKeyColName = guidColName;

const productsTableName = 'products';
const nameColName = 'name';
const products_guid_index_name = 'products_guid_idx';
const products_name_index_name = 'products_name_idx';
const productsKeyColName = guidColName;

const cartsTableName = 'carts';
const userGuidfkColName = 'user_guid';
const cartsUserGuidForeignKeyName = cartsTableName + '_' + userGuidfkColName + '_fkey';
const cartsKeyColName = guidColName;

const cartItemsTableName = 'cart_items';
const cartGuidFkColName = 'cart_guid';
const cartItemsCartsForeignKeyName = cartItemsTableName + '_' + cartGuidFkColName + '_fkey';
const productsGuidFkColName = 'product_guid';
const cartItemsProductGuidForeignKeyName = cartItemsTableName + '_' + productsGuidFkColName + '_fkey';

const ordersTableName = 'orders';
const ordersUserGuidForeignKeyName = ordersTableName + '_' + userGuidfkColName + '_fkey';
const ordersKeyColName = guidColName;

const orderItemsTableName = 'order_items';
const orderGuidFkColName = 'order_guid';
const ordersGuidForeignKeyName = orderItemsTableName + '_' + orderGuidFkColName + '_fkey';
const ordersProductsGuidForeignKeyName = orderItemsTableName + '_' + productsGuidFkColName + '_fkey';

module.exports = {
  usersTableName,
  guidColName,
  emailColName,
  googleColName,
  users_guid_index_name,
  users_email_index_name,
  usersKeyColName,
  productsTableName,
  nameColName,
  products_guid_index_name,
  products_name_index_name,
  productsKeyColName,
  cartsTableName,
  userGuidfkColName,
  cartsUserGuidForeignKeyName,
  cartsKeyColName,
  cartItemsTableName,
  cartItemsCartsForeignKeyName,
  productsGuidFkColName,
  cartItemsProductGuidForeignKeyName,
  ordersTableName,
  ordersUserGuidForeignKeyName,
  ordersKeyColName,
  orderItemsTableName,
  orderGuidFkColName,
  ordersGuidForeignKeyName,
  ordersProductsGuidForeignKeyName
};