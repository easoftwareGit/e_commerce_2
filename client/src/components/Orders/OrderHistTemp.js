import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatter, asMoney } from '../../tools/tools';
import { fetchUserOrders } from '../../store/orders/ordersSlice';

const OrderHistory = () => {

  const orderData = [
    {
      id: 1,
      modified: new Date("02/22/2023"),
      status: 'Shipped',
      total_price: asMoney(81.46)
    },
    {
      id: 2,
      modified: new Date("03/13/2023"),
      status: 'Shipped',
      total_price: asMoney(577.69)
    },
    {
      id: 3,
      modified: new Date("10/01/2023"),
      status: 'Pending',
      total_price: asMoney(1249.50)
    },
  ]

  const itemsData = [
    {
      id: 1,
      orderId: 1,
      item: 'STIG',
      price: asMoney(12.34),
      quantity: 1,
      total: asMoney(12.34)
    },
    {
      id: 2,
      orderId: 1,
      item: 'BRIMNES',
      price: asMoney(34.56),
      quantity: 2,
      total: asMoney(69.12)
    },
    {
      id: 3,
      orderId: 2,
      item: 'EKET',
      price: asMoney(56.78),
      quantity: 4,
      total: asMoney(227.12)
    },
    {
      id: 4,
      orderId: 2,
      item: 'IVAR',
      price: asMoney(123.45),
      quantity: 1,
      total: asMoney(350.57)
    },
    {
      id: 5,
      orderId: 3,
      item: 'INGOLF',
      price: asMoney(99.95),
      quantity: 6,
      total: asMoney(599.70)
    },
    {
      id: 6,
      orderId: 3,
      item: 'FRANKLIN',
      price: asMoney(49.95),
      quantity: 3,
      total: asMoney(149.85)
    },
    {
      id: 7,
      orderId: 3,
      item: 'FLINTAN',
      price: asMoney(499.95),
      quantity: 1,
      total: asMoney(499.95)
    },
  ]

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const orders = useSelector((state) => state.orders);
  useEffect(() => {
    if (user.data.uuid) {
      dispatch(fetchUserOrders(user.data.uuid))
    }
  }, [])

  const initPluses = [];
  orderData.forEach(order => {
    initPluses.push({
      id: order.id,
      showPlus: true
    });
  });
  const [showChildren, setShowChildren] = useState(initPluses)

  const childButtonClass = (orderId) => {
    const showChild = showChildren.find((child) => child.id === orderId);
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

  const childButtonText = (orderId) => {
    const showChild = showChildren.find((child) => child.id === orderId);
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

  const handleClick = (orderId) => {
    setShowChildren(showChildren.map(child => {
      if (child.id === orderId) {
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
      <table className='table table-hover'>
        <thead>
          <tr>
            <th scope='col' className='w-25'></th>
            <th scope='col' className='w-25'>Date</th>
            <th scope='col' className='w-25'>Status</th>
            <th scope='col' className='w-25 text-end'>Total</th>
          </tr>          
        </thead>
        <tbody>
          {orderData.map(order => (  
            <>
              <tr key={order.id}>
                <td className='text-center'>                
                  <button
                    type='button'                  
                    className={childButtonClass(order.id)}
                    onClick={() => handleClick(order.id)}
                  >
                    {childButtonText(order.id)}
                  </button>
                </td>
                <td className='align-middle'>{order.modified.toLocaleDateString()}</td>
                <td className='align-middle'>{order.status}</td>
                <td className='text-end align-middle'>{formatter.format(order.total_price)}</td>              
              </tr>            
              <tr>
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
                      {itemsData.map(item => (
                        { }
                        // {item.orderId === order.id ? (
                        //   <tr></tr>
                        // ) : null}
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
      {/* <p>
        <a class="btn btn-primary" data-bs-toggle="collapse" href="#multiCollapseExample1" role="button" aria-expanded="false" aria-controls="multiCollapseExample1">Toggle first element</a>
        <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#multiCollapseExample2" aria-expanded="false" aria-controls="multiCollapseExample2">Toggle second element</button>
        <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target=".multi-collapse" aria-expanded="false" aria-controls="multiCollapseExample1 multiCollapseExample2">Toggle both elements</button>
      </p>
      <div class="row">
        <div class="col">
          <div class="collapse multi-collapse" id="multiCollapseExample1">
            <div class="card card-body">
              Some placeholder content for the first collapse component of this multi-collapse example. This panel is hidden by default but revealed when the user activates the relevant trigger.
            </div>
          </div>
        </div>
        <div class="col">
          <div class="collapse multi-collapse" id="multiCollapseExample2">
            <div class="card card-body">
              Some placeholder content for the second collapse component of this multi-collapse example. This panel is hidden by default but revealed when the user activates the relevant trigger.
            </div>
          </div>
        </div>
      </div>       


      */}

    </div>
  );
};

export default OrderHistory;