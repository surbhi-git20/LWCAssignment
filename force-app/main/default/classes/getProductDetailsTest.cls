@IsTest 
public class getProductDetailsTest {

     @TestSetup
    static void makeTestData(){
        Product2 producto =new Product2();
        producto.Name='test';
        producto.productCode='1234';
        producto.isActive = true;
        
        insert producto;
        
		Id pricebookId = Test.getStandardPricebookId();      
        
	    PricebookEntry one = new PricebookEntry();
	    one.pricebook2Id = pricebookId;
	    one.product2id = producto.id;
	    one.unitprice = 1249.0;
	    one.isactive = true;
	    insert one;
    }
        @IsTest
    	static void testgetProductList(){
        Test.startTest();
        {
   		 List<PricebookEntry>pricebookentrylist = getProductDetails.getProductList();
        }
        Test.stopTest();
        }
	
}