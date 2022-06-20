public with sharing class orderProductHandler {
    public orderProductHandler() {

    }
    @AuraEnabled
    public static string addtoOrder(String pbelistids){
        List < String > recordIds = pbelistids.split(',');
        List<Order> existingorderlist = [Select id, AccountId, Status from Order where Status != 'Activated' and createdbyId =:userinfo.getuserid()];
        List<PricebookEntry>pbelist = [Select Id, Product2Id, UnitPrice,Product2.Name from PricebookEntry where Id IN :recordIds] ;  

        try {
        if(existingorderlist.size()== 0)
            {
                Order newodr = createorder();
                if(newodr != null && pbelist.size() >0)
                    {
                    createorderitem(newodr,pbelist);
                    }
            }

            else if(existingorderlist.size()> 0 && pbelist.size()>0)
            {
                List<OrderItem> existingorderitemList = [Select id, Product2Id, Quantity, OrderId, Status__c, PricebookEntryId from OrderItem where Status__c = 'Draft' and OrderId =:existingorderlist[0].id];
                Map<Id, OrderItem> existingorderitemMap = new Map<Id, OrderItem>();
                List<OrderItem> orderitemlisttobeupdated = new List<OrderItem>();
                List<PricebookEntry> orderitemlisttobeinserted = new List<PricebookEntry>();


                for (OrderItem odritem: existingorderitemList)
                {
                    existingorderitemMap.put(odritem.Product2Id,odritem);
                }

                for(PricebookEntry pbe : pbelist)
                {
                    if(existingorderitemMap!= null && existingorderitemMap.containsKey(pbe.Product2Id))
                    {
                        existingorderitemMap.get(pbe.Product2Id).Quantity = existingorderitemMap.get(pbe.Product2Id).Quantity +1;
                        orderitemlisttobeupdated.add(existingorderitemMap.get(pbe.Product2Id));
                    }

                   else
                    {   
                        orderitemlisttobeinserted.add(pbe);
                    }

                }

                if(!orderitemlisttobeinserted.isEmpty()){
                    createorderitem(existingorderlist[0], orderitemlisttobeinserted);
                }

                if(!orderitemlisttobeupdated.isEmpty()){
                    map<Id,OrderItem> OrderItemupdateMap = new map<Id,OrderItem>();
                    OrderItemupdateMap.putall(orderitemlisttobeupdated);
                    if(OrderItemupdateMap.size()>0){
                        update OrderItemupdateMap.values();
                     }
                }
            }
        } 
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return 'Success';
    }
    public static Order createorder(){
        Id PriceBookId;
        Account acc = [Select id from Account Limit 1];
        if (Test.isRunningTest()){
           PriceBookId= Test.getStandardPricebookId();
        }
        else{
            PriceBookId= [select Id, Name from Pricebook2 where IsActive = true and IsStandard = true limit 1].id ;
        }
        Order odr = new Order();
        odr.Status = 'Draft';
        odr.AccountID = acc.id;
        odr.EffectiveDate = System.today();
        odr.PriceBook2Id =PriceBookId;
        try {
            insert odr; 
        } catch (Exception e) {
            
        }
       
        if(odr != null)
        {
            return odr;
        }
        else {
            return null;
        }
    }

    public static void createorderitem(Order orderrecord,List<PricebookEntry> pbelist){
        List<Orderitem> orderitemlist = new List<Orderitem>();
        for (PricebookEntry pbe : pbelist)
            {
                Orderitem oitem = new Orderitem();
                oitem.OrderId = orderrecord.id;
                oitem.Quantity = 1;
                oitem.UnitPrice = pbe.UnitPrice;
                oitem.PricebookEntryId =pbe.id;
                oitem.Product2Id = pbe.Product2Id;
        
                orderitemlist.add(oitem);
            }
        try {
            if(orderitemlist.size() >0){
                insert orderitemlist; 
            }
        } catch (Exception e) {
            
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Orderitem> getOrderProductList() {
        return [Select id, Product2.Name, Quantity, UnitPrice,TotalPrice,OrderId from OrderItem where Status__c = 'Draft' and createdbyId =:userinfo.getuserid()];
    }

    @AuraEnabled
    public static void activateOrder(Id orderId) {
        Order orderrec= [Select id, Name,Status from Order where Id =:orderid];
        orderrec.Status= 'Activated';
        try{
            update orderrec;
        }
        catch(Exception e){

        }
    }
}