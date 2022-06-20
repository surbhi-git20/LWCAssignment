import { LightningElement ,api, wire, track} from 'lwc';
import getOrderProductList from '@salesforce/apex/orderProductHandler.getOrderProductList';
import activateOrder from '@salesforce/apex/orderProductHandler.activateOrder';

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
 
    @track error;
    @track orderprodList ;
    @track currentorderId;    
    @wire(getOrderProductList)
    wiredOrderitems({
        error,
        data
    }) {
        if (data) {

            let tempRecords = JSON.parse( JSON.stringify( data ) );
            tempRecords = tempRecords.map( row => {
                return { Name: row.Product2.Name, UnitPrice: row.UnitPrice, Quantity: row.Quantity, ItemTotalPrice:row.TotalPrice,orderrecord: row.OrderId};
            })
            this.orderprodList = tempRecords;
            this.currentorderId =tempRecords[0].orderrecord;
        } else if (error) {
            this.error = error;
        }
    }

    handleclick(){
        this.displaySpinner = true;
        activateOrder({
            orderId: this.currentorderId,
        })
        .then(result => {
            this.displaySpinner = false;
            this.showCategories = false;
            this.showFinish = true;
        })
        .catch((error) => {
            const evt = new ShowToastEvent({
                            title: 'Application Error',
                            message: error.body.message,
                            variant: 'error',
                            mode: 'dismissable'
                        });
           // this.dispatchEvent(evt);
            this.displaySpinner = false;
        });
    }
}