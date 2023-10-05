import React from 'react';

const ModalMsg = (props) => {

  const { modalId, title, message, confirm, action, actionProps } = props;  

  return (
    <div
      class="modal fade"      
      id={modalId}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="staticBackdropLabel">{title}</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">{message}</div>
          <div class="modal-footer">
            {(confirm)
              ? <div> 
                  <button
                    type="button"
                    class="btn btn-success mx-3"
                    id="yes-button"
                    data-bs-dismiss="modal"
                    onClick={() => action(actionProps)}
                  >
                    Yes
                  </button>
                  <button type="button" class="btn btn-danger" data-bs-dismiss="modal">No</button>
                </div>
              :
                <button type="button" class="btn btn-primary" data-bs-dismiss="modal"> OK </button>}
            {/* <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalMsg;