export const homeId = 0;
export const productsId = 1;
export const cartId = 2;
export const checkoutId = 3;
export const orderHistoryId = 4;
export const loginId = 5;
export const registerId = 6;
export const logoutId = 7;

const MenuItems = [
  {
    id: productsId,
    active: false,
    visible: true,
    href: "/products",
    linkText: "Products"
  },
  {
    id: cartId,
    active: false,
    visible: true,
    href: "/cart",
    linkText: "Cart"
  },
  {
    id: checkoutId,
    active: false,
    visible: true,
    href: "/checkout",
    linkText: "Check Out"
  },
  {
    id: orderHistoryId,
    active: false,
    visible: true,
    href: "/orderhistory",
    linkText: "Order History"
  },
  {
    id: loginId,
    active: false,
    visible: true,
    href: "/login",
    linkText: "Log In"
  },
  {
    id: registerId,
    active: false,
    visible: true,
    href: "/register",
    linkText: "Register"
  },
  {
    id: logoutId,
    active: false,
    visible: false,
    href: "/logout",
    linkText: "Log Out"
  },
];

export default MenuItems;
