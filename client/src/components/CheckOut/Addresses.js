import React from "react";

const Addresses = () => {

  return (
    <div id="addresses_container">
      <div className="row">
        <div col-12>
          <h4>Shipping Address</h4>          
        </div>        
      </div>
      <div className="row">
        <div class="col-md-6">
          <input 
            type="text"
            className="form-control"
            placeholder="First name"
            id="shihpping_first_name"
          />
        </div>
        <div class="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Last Name"
            id="shipping_last_name"
          />
        </div>
        <div class="col-md-12">
          <input
            type="text"
            className="form-control"
            placeholder="Address 1"
            id="shipping_address_1"
          />
        </div>
        <div class="col-md-12">
          <input
            type="text"
            className="form-control"
            placeholder="Address 2"
            id="shipping_address_2"
          />
        </div>
        <div class="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="City"
            id="shipping_city"
          />
        </div>
        <div class="col-md-3">
          <select
            class="form-select"
            id="shipping_state"            
          >
            <option selected disabled value="">State...</option>
            <option>...</option>
          </select>
        </div>
        <div class="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Zip"
            id="shipping_zip"
          />
        </div>
      </div>
    </div>
  );
}

export default Addresses;