import { LightningElement ,api, wire, track} from 'lwc';
import getProductList from '@salesforce/apex/getProductDetails.getProductList';
import addtoOrder from '@salesforce/apex/orderProductHandler.addtoOrder';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {publish,subscribe, unsubscribe,APPLICATION_SCOPE,MessageContext} from "lightning/messageService";
import SAMPLEMC from "@salesforce/messageChannel/custommessageChannel__c";

export default class LightningDatatableLWCExample extends LightningElement {
    @track error;
    @track prodList ;
    wiredpricebookentryList = [];
    disableButton= false;
    subscription = null;
    @wire(MessageContext)
    messageContext;
    displaySpinner = false;
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
        }
    ];

    @wire(getProductList)
    wiredPricebookEntry(result) 
    {
        this.wiredpricebookentryList = result;
        if (result.data) {
            let tempRecords = JSON.parse( JSON.stringify( result.data ) );
            tempRecords = tempRecords.map( row => {
                return { Name: row.Product2.Name, UnitPrice: row.UnitPrice, pbookid: row.Id};
            })
            this.prodList = tempRecords;
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
            if (message.source == "orderproduct") {
                console.log('listener2' ,message);
                this.disableButton = true;
            } 
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
    handleclick() {
        this.displaySpinner = true;
        var selectedRecords =  this.template.querySelector("lightning-datatable").getSelectedRows();
        if(selectedRecords.length > 0){

            let ids = '';
            selectedRecords.forEach(currentItem => {
                ids = ids + ',' + currentItem.pbookid;
            });
            this.selectedIds = ids.replace(/^,/, '');
            //this.lstSelectedRecords = selectedRecords;
            addtoOrder({
                pbelistids: this.selectedIds,
            
            })
            .then(result => {
                if(result == 'Success') {
                    eval("$A.get('e.force:refreshView').fire();");
                    this.template.querySelector('lightning-datatable').selectedRows = [];
                    const message = {
                        message : "This is simple message from LWC",
                        source : "availableproduct"
                    };
                    publish(this.messageContext, SAMPLEMC, message);
                    this.displaySpinner = false;
                }

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
    
}