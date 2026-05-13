import apiClient from '../config/api';
import { logger } from '../lib/logger';

class PaymentService {
  innbucksInterval: number;
  maxPollingAttempts: number;

  constructor() {
    this.innbucksInterval = 30000; // 30 seconds
    this.maxPollingAttempts = 10;
  }

  /**
   * Create order with PayNow payment gateway
   * @param {Object} orderPayload - Order details
   * @returns {Promise} Payment initiation response with redirectLink
   */
  async createOrderPayNow(orderPayload: any) {
    try {
      const response = await apiClient.post('StoreInvoices/PayNow/InitiatePayment', orderPayload);
      if (!response) {
        return { success: false, error: 'PayNow initiation failed - no response' };
      }

      if (response.redirectLink) {
        // Open PayNow in new window
        window.open(response.redirectLink, '_blank');
      }

      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Preview cart (creates a cart and returns cartId + totals)
   * @param {Object} orderPayload - Order details
   */
  async previewCart(orderPayload: any) {
    try {
      // Oldyomik path is StoreInvoices/Carts (preferred).
      // Try it first, then fallback to Cart/Preview when needed.
      let response = null;
      try {
        response = await apiClient.post('StoreInvoices/Carts', orderPayload);
      } catch (error: any) {
        if (error.status === 404 || error.status === 405) {
          response = await apiClient.post('Cart/Preview', orderPayload);
        } else {
          throw error;
        }
      }

      if (!response) {
        logger.error('[PaymentService] Cart preview returned no response');
        return { success: false, error: 'Cart preview failed - no response' };
      }

      return { success: true, data: response };
    } catch (error: any) {
      logger.error('[PaymentService] Cart preview error:', {
        message: error.message,
        status: error.status,
        rawText: error.rawText,
      });
      return { success: false, error: error.message || 'Cart preview failed' };
    }
  }

  /**
   * Create order with InnBucks mobile money
   * @param {Object} orderPayload - Order details
   * @returns {Promise} Payment code for user to claim
   */
  async createOrderInnBucks(orderPayload: any) {
    try {
      const response = await apiClient.post('StoreInvoices/InnBucks/GetPaymentCode', orderPayload);
      if (!response) {
        return { success: false, error: 'InnBucks initiation failed - no response' };
      }
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create order from preview cart (InnBucks)
   * Gets payment code for user to claim
   * @param {Object} payload - { cartId }
   */
  async createOrderFromCartInnBucks(payload: any) {
    try {
      if (!payload.cartId) {
        logger.error('[PaymentService] Missing cartId for InnBucks:', payload);
        return { success: false, error: 'Missing cartId - cart preview may have failed' };
      }

      // Send minimal payload - just cartId
      const innbucksPayload = { cartId: payload.cartId };
      logger.debug('[PaymentService] InnBucks GetPaymentCode request:', innbucksPayload);

      let response = null;
      try {
        // Try StoreInvoices endpoint (primary for checkout)
        response = await apiClient.post('StoreInvoices/InnBucks/GetPaymentCode', innbucksPayload);
      } catch (error: any) {
        // Fallback to StoreIncomingPayments for wallet funding
        if (error.status === 404 || error.status === 405) {
          response = await apiClient.post('StoreIncomingPayments/InnBucks/GetPaymentCode', innbucksPayload);
        } else {
          throw error;
        }
      }

      if (!response) {
        logger.error('[PaymentService] InnBucks response was empty');
        return { success: false, error: 'InnBucks initiation failed - no response' };
      }

      logger.debug('[PaymentService] InnBucks response:', { code: response.code, hasQR: !!response.qrCode });
      return { success: true, data: response };
    } catch (error: any) {
      logger.error('[PaymentService] InnBucks error:', error.message);
      return { success: false, error: error.message || 'InnBucks payment failed' };
    }
  }

  /**
   * Create order from preview cart (PayNow)
   * Gets redirect link to PayNow payment portal
   * @param {Object} payload - { cartId }
   */
  async createOrderFromCartPayNow(payload: any) {
    try {
      if (!payload.cartId) {
        logger.error('[PaymentService] Missing cartId for PayNow:', payload);
        return { success: false, error: 'Missing cartId - cart preview may have failed' };
      }

      // Send minimal payload - just cartId
      const paynowPayload = { cartId: payload.cartId };
      logger.debug('[PaymentService] PayNow InitiatePayment request:', paynowPayload);

      let response = null;
      try {
        // Try StoreInvoices endpoint (primary for checkout)
        response = await apiClient.post('StoreInvoices/PayNow/InitiatePayment', paynowPayload);
      } catch (error: any) {
        // Fallback to StoreIncomingPayments for wallet funding
        if (error.status === 404 || error.status === 405) {
          response = await apiClient.post('StoreIncomingPayments/PayNow/InitiatePayment', paynowPayload);
        } else {
          throw error;
        }
      }

      if (!response) {
        logger.error('[PaymentService] PayNow response was empty');
        return { success: false, error: 'PayNow initiation failed - no response' };
      }

      logger.debug('[PaymentService] PayNow response received:', { hasRedirectLink: !!response.redirectLink });
      return { success: true, data: response };
    } catch (error: any) {
      logger.error('[PaymentService] PayNow error:', error.message);
      return { success: false, error: error.message || 'PayNow payment failed' };
    }
  }

  /**
   * Create order from preview cart (COD, Account, Ecocash)
   * Finalizes the order after cart preview
   * @param {Object} payload - { cartId, paymentMethod }
   */
  async createOrderFromCart(payload: any) {
    try {
      if (!payload.cartId) {
        logger.error('[PaymentService] Missing cartId in payload:', payload);
        return { success: false, error: 'Missing cartId - cart preview may have failed' };
      }

      // Send minimal payload - cartId is primary identifier
      const orderPayload = {
        cartId: payload.cartId
      };

      // Include payment method if provided (for audit/tracking)
      if (payload.paymentMethod) {
        (orderPayload as any).paymentMethod = payload.paymentMethod;
      }

      logger.debug('[PaymentService] Order creation request:', orderPayload);

      let response = null;
      // Try StoreInvoices endpoint (most common for this operation)
      try {
        response = await apiClient.post('StoreInvoices', orderPayload);
        logger.info('[PaymentService] Order created via StoreInvoices endpoint');
      } catch (error: any) {
        // Try alternative endpoints
        const fallbacks = ['StoreOrders', 'Orders'];
        for (const endpoint of fallbacks) {
          try {
            logger.debug(`[PaymentService] Trying fallback endpoint: ${endpoint}`);
            response = await apiClient.post(endpoint, orderPayload);
            logger.info(`[PaymentService] Order created via ${endpoint} endpoint`);
            break;
          } catch (fallbackError: any) {
            logger.warn(`[PaymentService] ${endpoint} failed, continuing...`);
          }
        }

        // If all failed, throw the original error
        if (!response) {
          throw error;
        }
      }

      if (!response) {
        throw new Error('Order creation failed - no response from server');
      }

      logger.debug('[PaymentService] Order response:', { docEntry: response.docEntry, docNum: response.docNum });
      return { success: true, data: response };
    } catch (error: any) {
      logger.error('[PaymentService] Order creation error:', {
        message: error.message,
        status: error.status,
        rawText: error.rawText
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Check InnBucks transaction status
   * @param {Object} payload - { reference, code }
   */
  async checkInnBucksTransaction(payload: any) {
    try {
      const response = await apiClient.post('InnBucks/EnquireCode', payload);
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Poll InnBucks transaction status
   * @param {Object} pollingPayload - { reference, code } from createOrderInnBucks
   * @param {function} onSuccess - Callback when payment is claimed
   * @param {function} onError - Callback on error
   * @param {function} onTimeout - Callback when max attempts reached
   */
  pollInnBucksStatus(pollingPayload: any, onSuccess: any, onError: any, onTimeout: any) {
    let attempts = 0;

    const checkStatus = async () => {
      attempts++;

      if (attempts > this.maxPollingAttempts) {
        clearInterval(pollingInterval);
        if (onTimeout) onTimeout();
        return;
      }

      try {
        const response = await apiClient.post('InnBucks/EnquireCode', pollingPayload);

        if (response.status === 'Claimed' || response.transactionStatus === 'Claimed') {
          clearInterval(pollingInterval);
          if (onSuccess) onSuccess(response);
        }
      } catch (error: any) {
        logger.error('Error polling InnBucks:', error);
        if (onError) onError(error);
      }
    };

    // Start polling
    checkStatus();
    const pollingInterval = setInterval(checkStatus, this.innbucksInterval);

    // Return function to cancel polling
    return () => clearInterval(pollingInterval);
  }

  /**
   * Create direct order (COD, Pay on Account, Ecocash)
   * @param {Object} orderPayload - Order details
   * @returns {Promise} Order creation response
   */
  async createOrder(orderPayload: any) {
    try {
      const response = await apiClient.post('StoreInvoices', orderPayload);
      if (!response) {
        return { success: false, error: 'Order creation failed - no response' };
      }
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create incoming payment for invoice or wallet funding
   * @param {Object} paymentPayload - Payment details
   * @returns {Promise} Payment creation response
   */
  async createIncomingPayment(paymentPayload: any) {
    try {
      const response = await apiClient.post('StoreIncomingPayments', paymentPayload);
      if (!response) {
        return { success: false, error: 'Incoming payment failed - no response' };
      }
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Pay existing invoice with PayNow
   * @param {Object} paymentPayload - Payment details with paymentInvoices array
   * @returns {Promise} Payment initiation response
   */
  async payInvoicePayNow(paymentPayload: any) {
    try {
      const response = await apiClient.post('StoreIncomingPayments/PayNow/InitiatePayment', paymentPayload);
      if (!response) {
        return { success: false, error: 'PayNow payment failed - no response' };
      }

      if (response.redirectLink) {
        window.open(response.redirectLink, '_blank');
        return { success: true, data: response };
      }

      return { success: false, error: 'PayNow payment initiated but no redirect link was returned. Please try again or contact support.' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Pay existing invoice with InnBucks
   * @param {Object} paymentPayload - Payment details with paymentInvoices array
   * @returns {Promise} Payment code response
   */
  async payInvoiceInnBucks(paymentPayload: any) {
    try {
      const response = await apiClient.post('StoreIncomingPayments/InnBucks/GetPaymentCode', paymentPayload);
      if (!response) {
        return { success: false, error: 'InnBucks payment failed - no response' };
      }
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Build order payload from cart items
   * @param {Object} formData - Checkout form data
   * @param {Array} cartItems - Cart items
   * @param {Object} user - Current user (optional)
   * @returns {Object} Order payload
   */
  buildOrderPayload(formData: any, cartItems: any) {
    const documentLines = cartItems.map((item: any, index: any) => ({
      lineNum: index,
      itemCode: item.itemCode,
      itemDescription: item.itemName,
      quantity: item.quantity,
      priceAfterVAT: item.uom?.price ?? item.price ?? 0,
      warehouseCode: item.warehouseCode,
      vatGroup: item.salesVATGroup,
      vatRate: item.salesVATRate,
      text: null,
      uoMEntry: item.uom?.uomEntry ?? null,
      uoMCode: null
    }));

    const billingAddress = {
      firstName: formData.firstName || '',
      secondName: formData.secondName || '',
      lastName: formData.lastName || '',
      companyName: formData.companyName || '',
      addressLine1: formData.billingAddress || formData.billAddressLine1 || '',
      addressLine2: formData.billingAddressLine2 || '',
      suburb: formData.billingSuburb || formData.billSuburb || '',
      city: formData.billingCity || formData.billCity || '',
      country: formData.billingCountry || formData.billCountry || 'Zimbabwe',
      phoneNumber: formData.paymentPhoneNumber || formData.mobileNumber || formData.mobile || '',
      latitude: '',
      longitude: '',
      countryCode: formData.billCountry || formData.billingCountry || '',
      countryName: formData.billCountryName || formData.billingCountry || ''
    };

    const shippingAddress = formData.useShippingAddress ? {
      firstName: formData.firstName || '',
      secondName: formData.secondName || '',
      lastName: formData.lastName || '',
      companyName: formData.companyName || '',
      addressLine1: formData.shippingAddress || formData.shipAddressLine1 || billingAddress.addressLine1,
      addressLine2: formData.shipAddressLine2 || '',
      suburb: formData.shippingSuburb || formData.shipSuburb || billingAddress.suburb,
      city: formData.shippingCity || formData.shipCity || billingAddress.city,
      country: formData.shippingCountry || formData.shipCountry || billingAddress.country,
      phoneNumber: formData.paymentPhoneNumber || formData.mobileNumber || formData.mobile || billingAddress.phoneNumber,
      latitude: '',
      longitude: '',
      countryCode: formData.shipCountry || formData.shippingCountry || billingAddress.countryCode,
      countryName: formData.shipCountryName || formData.shippingCountry || billingAddress.countryName
    } : billingAddress;

    const payload: any = {
      docCurrency: formData.docCurrency || formData.currency || 'USD',
      comments: formData.deliveryInstructions || '' ,
      paymentReference: formData.paymentReference || '',
      paymentMethod: formData.paymentMethod,
      documentLines,
      billToAddress: billingAddress,
      shipToAddress: shippingAddress,
      paymentPhoneNumber: formData.paymentPhoneNumber || formData.mobileNumber || formData.mobile || '',
      paymentFullName: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
      returnUrl: formData.returnUrl || (typeof window !== 'undefined' ? `${window.location.origin}/check-order` : ''),
      deliveryType: formData.deliveryType || 'asap'
    };

    if (formData.deliveryType === 'scheduled') {
      payload.scheduledDate = formData.scheduledDate;
      payload.scheduledTimeSlot = formData.scheduledTimeSlot;
    }

    return payload;
  }
}

const paymentService = new PaymentService();
export default paymentService;
