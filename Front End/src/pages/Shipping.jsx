import Herotext from "../components/Herotext";
import { COMPANY_INFO } from '../constants/companyInfo';
const Shipping = () => {
  return (
    <>
      <div style={{paddingTop:"150px"}}></div>
      <section className=" bg-gray-50 py-20 px-20 ">
              <h1 className="text-6xl font-semibold text-gray-700">
                Shipping and Delivery
              </h1>
              <p className="text-lg text-gray-700">
Even though we are a website, and we function 24x7, recipient business hours are from 1000 to 1900 hours Monday to Friday. All orders will be prepared and dispatched within 2 working days of placement of order with our preferred carriers. Even though delivery time is stipulated and not in our ultimate control, we expect the customer to receive the ordered product within 3-5 working days of dispatch.
<br/>
If your tracking details show “Delivered” but you have not received it, we request you to please contact us immediately within 24hrs of order marked delivered. Beyond that the courier partner is not liable to investigate.
<br />
 <br/>

<b>Returns & Replacements</b>
<br/>
{COMPANY_INFO.name} takes pride in making sure the customer gets what he/she sees and sees what he/she expects. Each and every product of ours is comprehensively tested and tried. On grounds of production deformities, like expired product and wrong product delivered, we will take the product back without any questions asked. 
<br/>
We investigate returns & refunds request if and only if they are supported by unboxing videos shot from the scratch where you receive shrink wrapped jars in our corrugated boxes. This ensures a transparent practice and helps us to provide a better resolution.
<br/>
We do not take responsibility for refunds if they are of this nature: 
<br/>
<ul>
<li>Customer faces allergic reactions. </li>
<li>Error in the address input. </li>
<li>Inability to comprehend the product.</li>
<li>Wrong product ordered.</li>
<li>Need of the product is no longer there.</li>
</ul>
<br/>
We are highly transparent about our practices, ingredients, and usage of the product. We ensure all customer queries are resolved with respect to our product.
<br/>
If you wish to replace our sealed product with another variant of the same value there will be an additional charge of Rs.200 for scheduling one-time pick-up from your address.
<br/>
Please note that only a part of the order cannot be exchanged. In case of refunds please allow 10-12 working days for the entire process to be completed.
<br/>
<b>Cancellation</b>
<br/>
Even though we do not have any discretions over orders being placed on our website by visitors, we do hold the eventual authority over fulfilling it. We might put an order on hold or cancel it if it is deemed fraudulent or malicious, without liability. We also reserve the right to refuse or cancel orders in scenarios like inaccuracies in pricing of product on the website and stock unavailability. We may also require additional verification or information before accepting any order. We may contact you if all or any portion of your order is cancelled or if additional information is required to accept your order. If your order is cancelled after your card has been charged, the said amount will be reversed to your account. Any promotional voucher used for the cancelled orders may not be refunded. Further, in case of suspicious transactions, we reserve the right to inform law enforcement officials and provide them with all transaction details that may be requested for investigation of any illegal activity.
<br/>
The customer may cancel their order within 2 working days of placing it with us. Once order is shipped, it is not under our control to cancel it. 
<br/>
<b>Payment, Pricing & Promotions</b>

There are 3 payment options over our website which the customer can use.

{/* Credit Card
Debit Cards
Net Banking
CoD */}
We will not take a single rupee more than the final invoice amount from your banking account. If in case you find extra charges being taken from you on transactions from us, please get in touch with us, or with your bankers.
<br/>
Our products are priced keeping in mind the product value and our expenses and costs. The prices you see in your final invoice include cost of packaging and delivering the product to you in optimum condition, inclusive of GST applicable. For the breakdown of taxable amount and GST applied, please check the invoice of your order.
<br/>
We might run promotions and offers on one or multiple products and different times. The price of the product is stagnant and promotional discounts and bundle offers may be provided if and when deemed appropriate and necessary. We are at discretion to discontinue or change a specific promotion or offer when we deem appropriate.
             </p>            
          
        
      </section>
    </>
  );
};

export default Shipping;
