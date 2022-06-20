import { LightningElement ,api, wire, track} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOrderProductList from '@salesforce/apex/orderProductHandler.getOrderProductList';
import activateOrder from '@salesforce/apex/orderProductHandler.activateOrder';
import {publish,subscribe, unsubscribe,APPLICATION_SCOPE,MessageContext} from "lightning/messageService";
import SAMPLEMC from "@salesforce/messageChannel/custommessageChannel__c";
import { refreshApex } from '@salesforce/apex';

export default class LightningDatatableLWCExample extends LightningElement {
    subscription = null;
    @wire(MessageContext)
    messageContext;
    @track error;
    @api orderprodList ;
    displaySpinner = false;
    @track currentorderId;  
    wiredorderitemList = [];
    @track columns = [{
            label: 'Product name',
            fieldName: 'Name',
            type: 'text',
            sortable: true
        },
        {
            label: 'Unit Price',
            fieldName: 'UnitPrice',
            type: 'Currency',
            sortable: true
        },
        {
            label: 'Quantity',
            fieldName: 'Quantity',
            type: 'Number',
            sortable: true
        }, 
        {
            label: 'Item Total Price',
            fieldName: 'ItemTotalPrice',
            type: 'Currency',
            sortable: true
        },

    ];
  
    @wire(getOrderProductList)
    wiredOrderitems(
        result
    )
     {
        this.wiredorderitemList = result;
        if (result.data) {

            let tempRecords = JSON.parse( JSON.stringify( result.data ) );
            tempRecords = tempRecords.map( row => {
                return { Name: row.Product2.Name, UnitPrice: row.UnitPrice, Quantity: row.Quantity, ItemTotalPrice:row.TotalPrice,orderrecord: row.OrderId};
            })
            this.orderprodList = tempRecords;
            this.currentorderId =tempRecords && tempRecords.length >0? tempRecords[0].orderrecord : '';
        } else if (result.error) {
            this.error = result.error;
        }
    }
    connectedCallback(){
        this.subscribeMC();
    }

    subscribeMC() {
        if (this.subscription) {
          return;
        }
        this.subscription = subscribe(
          this.messageContext,
          SAMPLEMC,
          message => {
            console.log('message' ,message);
            if (message.source == "availableproduct") {
                console.log('listener' ,message);
                refreshApex(this.wiredorderitemList);
            } 
            //this.handleMessage(message);
          },
          { scope: APPLICATION_SCOPE }
        );
      }
      unsubscribeMC() {
        unsubscribe(this.subscription);
        this.subscription = null;
      }

      disconnectedCallback()
      {
        this.unsubscribeMC();
      }

    handleclick(){
        this.displaySpinner = true;
        activateOrder({
            orderId: this.currentorderId,
        })
        .then(result => {
            const message = {
                message : "This is simple message from orderproduct",
                source:"orderproduct"
            };
            this.displaySpinner = false;
            publish(this.messageContext, SAMPLEMC, message);
            eval("$A.get('e.force:refreshView').fire();") 
            refreshApex(this.wiredorderitemList);
        })
        .catch((error) => {
            const evt = new ShowToastEvent({
                            title: 'Application Error',
                            message: error.body.message,
                            variant: 'error',
                            mode: 'dismissable'
                        });
            this.dispatchEvent(evt);
            this.displaySpinner = false;
        });
    }
}