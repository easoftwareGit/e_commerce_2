import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatter } from '../../tools/tools';
import { fetchUserOrders } from '../../store/orders/ordersSlice';
import { fetchUserOrderItems } from '../../store/orders/orderItemsSlice';

const OrderHistory = () => {

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const orders = useSelector((state) => state.orders);
  useEffect(() => {
    if (user.data.uuid) {
      dispatch(fetchUserOrders(user.data.uuid))
    }
  }, [])
  const orderItems = useSelector((state) => state.orderItems);
  useEffect(() => {
    if (user.data.uuid) {
      dispatch(fetchUserOrderItems(user.data.uuid))
    }
  }, [])

  const initPluses = [];
  orders.data.forEach(order => {
    initPluses.push({
      uuid: order.uuid,
      showPlus: true
    });
  });
  const [showChildren, setShowChildren] = useState(initPluses)

  const childButtonClass = (orderUuid) => {
    const showChild = showChildren.find((child) => child.uuid === orderUuid);
    if (showChild) {
      if (showChild.showPlus) {
        return 'btn btn-success'
      } else {
        return 'btn btn-danger'
      }    
    } else {
      return '';
    }
  }

  const childButtonText = (orderUuid) => {
    const showChild = showChildren.find((child) => child.uuid === orderUuid);
    if (showChild) {
      if (showChild.showPlus) {
        return '+'
      } else {
        return '-'
      }    
    } else {
      return '';
    }
  }

  const handleClick = (orderUuid) => {
    setShowChildren(showChildren.map(child => {
      if (child.uuid === orderUuid) {
        return {
          ...child,
          showPlus: !child.showPlus
        };
      } else {
        return child;
      }
    }))
  }


  return (
    <div>
      <h2 className='mb-3'>Check Out</h2>
      <table className='table table-hover table-bordered'>
        <thead>
          <tr>
            <th scope='col' className='w-25'></th>
            <th scope='col' className='w-25'>Date</th>
            <th scope='col' className='w-25'>Status</th>
            <th scope='col' className='w-25 text-end'>Total</th>
          </tr>          
        </thead>
        <tbody className="table-group-divider">
          {orders.data.map(order => (  
            <>
              <tr key={order.uuid}>
                <td className='text-center'>                
                  <button
                    type='button'                  
                    className={childButtonClass(order.id)}
                    onClick={() => handleClick(order.id)}
                    data-bs-toggle="collapse"
                    data-bs-target={`#${order.uuid}`}
                    aria-expanded="false"
                    aria-controls={order.uuid}
                  >
                    {childButtonText(order.id)}
                  </button>
                </td>
                <td className='align-middle'>{order.modified.toLocaleDateString()}</td>
                <td className='align-middle'>{order.status}</td>
                <td className='text-end align-middle'>{formatter.format(order.total_price)}</td>              
              </tr>            
              <tr class="collapse multi-collapse" id={order.uuid}>                
                <td colSpan={4}>
                  <table className='table table-hover'>
                    <thead>
                      <tr>
                        <th scope='col' className='w-25'>Item</th>
                        <th scope='col' className='w-25 text-end'>Price</th>
                        <th scope='col' className='w-25 text-center'>Quantity</th>
                        <th scope='col' className='w-25 text-end'>Total</th>                        
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.data.map(item => (
                        <> 
                          {item.order_uuid === order.uuid ? (
                            <tr key={item.uuid}>
                              <td>{item.name}</td>
                              <td className='text-end'>{formatter.format(item.price_unit)}</td>
                              <td className='text-center'>{item.quantity}</td>
                              <td className='text-end'>{formatter.format(item.item_total)}</td>
                            </tr>
                          ) : null}
                        </>                        
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderHistory;