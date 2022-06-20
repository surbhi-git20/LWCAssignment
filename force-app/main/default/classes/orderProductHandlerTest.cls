@IsTest 
public class orderProductHandlerTest {

    @TestSetup
     public static void makeTestData(){
        
        Account acc = new Account();
    	acc.Name='Test1';
    	   		
   		insert acc;
        
        Product2 producto =new Product2();
        producto.Name='test';
        producto.productCode='1234';
        producto.isActive = true;
        
        insert producto;
        
         Id pricebookId = Test.getStandardPricebookId();
      
	    PricebookEntry pbe = new PricebookEntry();
	    pbe.pricebook2Id = pricebookId;
	    pbe.product2id = producto.id;
	    pbe.unitprice = 1249.0;
	    pbe.isactive = true;
	    insert pbe;
        
        Order odr = new Order();
        odr.Status = 'Draft';
        odr.AccountID = acc.id;
        odr.EffectiveDate = System.today();
        odr.PriceBook2Id =pricebookId;
        insert odr; 
        
        Orderitem oitem = new Orderitem();
                oitem.OrderId = odr.id;
                oitem.Quantity = 1;
                oitem.UnitPrice = pbe.UnitPrice;
                oitem.PricebookEntryId =pbe.id;
                oitem.Product2Id = pbe.Product2Id;
        		insert oitem;
        
       // String test = orderProductHandler.addtoOrder(pbe.id);
    }
        @IsTest
    	static void testgetOrderProductList(){
            Test.startTest();
            {
             List<Orderitem>OrderItemlist = orderProductHandler.getOrderProductList();
            }
            Test.stopTest();
        }
    	@IsTest
    	static void testaddtoOrder(){
            Id pricebookId = Test.getStandardPricebookId();
            PricebookEntry pbe = [select Id, Product2Id, UnitPrice,  Product2.Name,Pricebook2Id from PricebookEntry where  Pricebook2Id =:pricebookId];
            Test.startTest();
            {
              orderProductHandler.addtoOrder(pbe.id);
            }
            Test.stopTest();
        }
    	@IsTest
    	static void testcreateOrder(){
            Order orderrec = [Select id, AccountId, Status from Order where Status != 'Activated'];
            orderrec.status= 'Activated';
            update orderrec;
            Id pricebookId = Test.getStandardPricebookId();
            PricebookEntry pbe = [select Id, Product2Id, UnitPrice,  Product2.Name,Pricebook2Id from PricebookEntry where  Pricebook2Id =:pricebookId];
            Test.startTest();
            {
              orderProductHandler.addtoOrder(pbe.id);
            }
            Test.stopTest();
        }
}