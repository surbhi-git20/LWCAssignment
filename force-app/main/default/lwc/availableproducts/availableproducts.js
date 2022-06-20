import { LightningElement ,api, wire, track} from 'lwc';
import getProductList from '@salesforce/apex/getProductDetails.getProductList';
import addtoOrder from '@salesforce/apex/orderProductHandler.addtoOrder';

export default class LightningDatatableLWCExample extends LightningElement {
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
 
    @track error;
    @track prodList ;
    @api recordId;
    @wire(getProductList)
    wiredPricebookEntry({
        error,
        data
    }) {
        if (data) {
            let tempRecords = JSON.parse( JSON.stringify( data ) );
            tempRecords = tempRecords.map( row => {
                return { Name: row.Product2.Name, UnitPrice: row.UnitPrice, pbookid: row.Id};
            })
            this.prodList = tempRecords;
        } else if (error) {
            this.error = error;
        }
    }

    handleclick() {
        this.displaySpinner = true;
        var selectedRecords =  this.template.querySelector("lightning-datatable").getSelectedRows();
        if(selectedRecords.length > 0){
            console.log('selectedRecords are ', selectedRecords);
   
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
                    const selectedEvent = new CustomEvent('added', { detail: this.recordId });
                    this.dispatchEvent(selectedEvent);
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