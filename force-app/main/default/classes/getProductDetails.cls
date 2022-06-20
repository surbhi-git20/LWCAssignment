public with sharing class getProductDetails {
    @AuraEnabled(cacheable=true)
    public static List<PricebookEntry> getProductList() {
        return [select Id, Product2Id, UnitPrice,  Product2.Name,Pricebook2Id from PricebookEntry where  PriceBook2.IsActive = true and Pricebook2.IsStandard = true];
    }
}