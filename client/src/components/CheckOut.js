import React, { useState } from 'react';
import { formatter, asMoney } from '../tools/tools';

const CheckOut = () => {

  const orderData = [
    {
      id: 1,
      modified: new Date("02/22/2323"),
      status: 'Shipped',
      total_price: asMoney(81.46)
    },
    {
      id: 2,
      modified: new Date("03/33/2323"),
      status: 'Shipped',
      total_price: asMoney(577.69)
    },
    {
      id: 3,
      modified: new Date("10/01/2323"),
      status: 'Pending',
      total_price: asMoney(1249.50)
    },
  ]

  const itemsData = [
    {
      id: 1,
      orderid: 1,
      item: 'STIG',
      price: asMoney(12.34),
      quantity: 1,
      total: asMoney(12.34)
    },
    {
      id: 2,
      orderid: 1,
      item: 'BRIMNES',
      price: asMoney(34.56),
      quantity: 2,
      total: asMoney(69.12)
    },
    {
      id: 3,
      orderid: 2,
      item: 'EKET',
      price: asMoney(56.78),
      quantity: 4,
      total: asMoney(227.12)
    },
    {
      id: 4,
      orderid: 2,
      item: 'IVAR',
      price: asMoney(123.45),
      quantity: 1,
      total: asMoney(350.57)
    },
    {
      id: 5,
      orderid: 3,
      item: 'INGOLF',
      price: asMoney(99.95),
      quantity: 6,
      total: asMoney(599.70)
    },
    {
      id: 6,
      orderid: 3,
      item: 'FRANKLIN',
      price: asMoney(49.95),
      quantity: 3,
      total: asMoney(149.85)
    },
    {
      id: 7,
      orderid: 3,
      item: 'FLINTAN',
      price: asMoney(499.95),
      quantity: 1,
      total: asMoney(499.95)
    },
  ]

  const showPluses = [];
  orderData.forEach(order => {
    showPluses.push({
      id: order.id,
      showPlus: true
    });
  });
  const [showChildren, setShowChildren] = useState([showPluses])

  const plusButtonClassText = (id) => {
    const showPlusObj = showPluses.filter(item => item.id === id);
    const plusClassTest = 'btn btn-success'
    if (showPlusObj.showPlus) {
      return `${plusClassTest} visible`
    } else {
      return `${plusClassTest} invisible`
    }
  }

  const minusButtonClassText = (id) => {
    const showPlusObj = showPluses.filter(item => item.id === id);
    const minusClassTest = 'btn btn-danger'
    if (showPlusObj.showPlus) {
      return `${minusClassTest} invisible`
    } else {
      return `${minusClassTest} visible`
    }
  }

  const handleClick = (id) => {
    setShowChildren(showChildren.map(child => {
      if (child.id === id) {
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
            <tr key={order.id}>
              <td className='text-center'>
                <button
                  type='button'                  
                  className={plusButtonClassText(order.id)}
                  onClick={() => handleClick(order.id)}
                >
                  +
                </button>
                <button
                  type='button'                  
                  className={minusButtonClassText(order.id)}
                  onClick={() => handleClick(order.id)}
                >
                  -
                </button>
              </td>
              <td className='align-middle'>{order.modified.toLocaleDateString()}</td>
              <td className='align-middle'>{order.status}</td>
              <td className='text-end align-middle'>{formatter.format(order.total_price)}</td>              
            </tr>
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
      </div>       */}

    </div>
  );
};

export default CheckOut;