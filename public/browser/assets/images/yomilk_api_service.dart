import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

/// YoMilk Store API Service
/// Handles all API interactions for the YoMilk store application
/// Features: Products, Cart, Orders, Payments, Delivery, Authentication
class YoMilkApiService {
  final String baseUrl;
  final String? authToken;
  final Duration timeout;

  /// Dart API Service Constructor
  /// 
  /// Parameters:
  ///   - [baseUrl]: Base API URL (e.g., 'https://yomilk.erpona.com:8092/api/')
  ///   - [authToken]: Authentication token for authenticated requests
  ///   - [timeout]: Request timeout duration (default 30 seconds)
  YoMilkApiService({
    required this.baseUrl,
    this.authToken,
    this.timeout = const Duration(seconds: 30),
  });

  /// Build HTTP headers with authentication
  Map<String, String> _buildHeaders({bool includeAuth = true}) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (includeAuth && authToken != null) 'Authorization': 'Bearer $authToken',
    };
  }

  /// Handle HTTP response and throw exceptions on error
  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      throw UnauthorizedException('Unauthorized - Token may be expired');
    } else if (response.statusCode == 404) {
      throw NotFoundException('Resource not found');
    } else if (response.statusCode == 400) {
      throw BadRequestException(
          jsonDecode(response.body)['message'] ?? 'Bad request');
    } else {
      throw ServerException(
          'Server error: ${response.statusCode} - ${response.body}');
    }
  }

  // ==================== AUTHENTICATION ====================

  /// Register a new customer
  /// 
  /// Parameters:
  ///   - [email]: Customer email
  ///   - [password]: Customer password
  ///   - [cardCode]: Optional card code
  /// 
  /// Returns: Registration response with user details
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    String? cardCode,
  }) async {
    final payload = {
      'email': email,
      'password': password,
      if (cardCode != null) 'cardCode': cardCode,
    };

    final response = await http
        .post(
          Uri.parse('${baseUrl}ExternalUsers/Register'),
          headers: _buildHeaders(includeAuth: false),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Register a complete customer with full details
  /// 
  /// Parameters:
  ///   - [payload]: Complete customer registration details
  /// 
  /// Returns: Complete registration response
  Future<Map<String, dynamic>> registerCompleteCustomer(
      Map<String, dynamic> payload) async {
    final response = await http
        .post(
          Uri.parse(
              '${baseUrl}StoreBusinessPartners/StoreCustomers/Register'),
          headers: _buildHeaders(includeAuth: false),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Verify customer email with token
  /// 
  /// Parameters:
  ///   - [email]: Customer email
  ///   - [token]: Verification token
  /// 
  /// Returns: Verification response
  Future<Map<String, dynamic>> verifyRegistration({
    required String email,
    required String token,
  }) async {
    final queryParams = {
      'email': email,
      'token': token,
    };

    final response = await http
        .get(
          Uri.parse('${baseUrl}ExternalUsers/Verify')
              .replace(queryParameters: queryParams),
          headers: _buildHeaders(includeAuth: false),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Login user
  /// 
  /// Parameters:
  ///   - [email]: User email
  ///   - [password]: User password
  /// 
  /// Returns: Login response with token and user details
  Future<LoginResponse> login({
    required String email,
    required String password,
  }) async {
    final payload = {
      'email': email,
      'password': password,
    };

    final response = await http
        .post(
          Uri.parse('${baseUrl}Auths/Login/BusinessPartners'),
          headers: _buildHeaders(includeAuth: false),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    final data = _handleResponse(response) as Map<String, dynamic>;
    return LoginResponse.fromJson(data);
  }

  /// Get session token for cash customers (visitors)
  /// 
  /// Returns: Session response with token
  Future<Map<String, dynamic>> getCashCustomerSession() async {
    final response = await http
        .get(
          Uri.parse('${baseUrl}Auths/CashCustomer/Session'),
          headers: _buildHeaders(includeAuth: false),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Request password reset OTP
  /// 
  /// Parameters:
  ///   - [emailAddress]: Email to reset password for
  /// 
  /// Returns: Response with OTP sent confirmation
  Future<Map<String, dynamic>> forgotPassword(
      {required String emailAddress}) async {
    final payload = {
      'emailAddress': emailAddress,
    };

    final response = await http
        .post(
          Uri.parse('${baseUrl}ExternalUsers/ResetPassword/GetOtp'),
          headers: _buildHeaders(includeAuth: false),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Reset password with OTP
  /// 
  /// Parameters:
  ///   - [email]: User email
  ///   - [otp]: One-time password
  ///   - [newPassword]: New password
  ///   - [confirmPassword]: Password confirmation
  /// 
  /// Returns: Reset confirmation
  Future<Map<String, dynamic>> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
    required String confirmPassword,
  }) async {
    final payload = {
      'email': email,
      'otp': otp,
      'newPassword': newPassword,
      'confirmNewPassword': confirmPassword,
    };

    final response = await http
        .post(
          Uri.parse('${baseUrl}ExternalUsers/ResetPassword'),
          headers: _buildHeaders(includeAuth: false),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Change password (requires authentication)
  /// 
  /// Parameters:
  ///   - [cardCode]: Business partner card code
  ///   - [oldPassword]: Current password
  ///   - [newPassword]: New password
  ///   - [confirmPassword]: Password confirmation
  /// 
  /// Returns: Change confirmation
  Future<Map<String, dynamic>> changePassword({
    required String cardCode,
    required String oldPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    final payload = {
      'oldPassword': oldPassword,
      'newPassword': newPassword,
      'confirmNewPassword': confirmPassword,
    };

    final response = await http
        .post(
          Uri.parse(
              '${baseUrl}StoreBusinessPartners/$cardCode/ChangePassword'),
          headers: _buildHeaders(),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  // ==================== PRODUCTS & STORE ====================

  /// Get store items/products with pagination and filtering
  /// 
  /// Parameters:
  ///   - [currency]: Currency code (default 'USD')
  ///   - [pageSize]: Number of items per page
  ///   - [pageNumber]: Page number (default 1)
  ///   - [filterExtension]: OData filter extension
  ///   - [queryExtension]: OData query extension
  /// 
  /// Returns: Paginated product list
  Future<ProductListResponse> getStoreItems({
    String currency = 'USD',
    required int pageSize,
    int pageNumber = 1,
    String filterExtension = '',
    String queryExtension = '',
  }) async {
    final queryParams = {
      'currency': currency,
      'pageSize': pageSize.toString(),
      'pageNumber': pageNumber.toString(),
      'filterExtension': filterExtension,
      'queryExtension': queryExtension,
    };

    final response = await http
        .get(
          Uri.parse('${baseUrl}StoreItems')
              .replace(queryParameters: queryParams),
          headers: _buildHeaders(),
        )
        .timeout(timeout);

    final data = _handleResponse(response) as Map<String, dynamic>;
    return ProductListResponse.fromJson(data);
  }

  /// Get single product details
  /// 
  /// Parameters:
  ///   - [itemCode]: Product item code
  /// 
  /// Returns: Single product with UoMs
  Future<ProductListResponse> getSingleProduct({
    required String itemCode,
  }) async {
    final filterExtension = "\$filter = ItemCode eq '$itemCode'";
    final queryParams = {
      'filterExtension': filterExtension,
    };

    final response = await http
        .get(
          Uri.parse('${baseUrl}StoreItems')
              .replace(queryParameters: queryParams),
          headers: _buildHeaders(),
        )
        .timeout(timeout);

    final data = _handleResponse(response) as Map<String, dynamic>;
    return ProductListResponse.fromJson(data);
  }

  /// Get product categories/item groups
  /// 
  /// Parameters:
  ///   - [pageSize]: Number of categories per page
  ///   - [pageNumber]: Page number
  ///   - [filterExtension]: OData filter
  ///   - [queryExtension]: OData query
  /// 
  /// Returns: Category list
  Future<Map<String, dynamic>> getItemGroups({
    int pageSize = 20,
    int pageNumber = 1,
    String filterExtension = '',
    String queryExtension = '',
  }) async {
    final queryParams = {
      'queryExtension': queryExtension,
      'pageSize': pageSize.toString(),
      'pageNumber': pageNumber.toString(),
      'filterExtension': filterExtension,
    };

    final response = await http
        .get(
          Uri.parse('${baseUrl}StoreItemGroups')
              .replace(queryParameters: queryParams),
          headers: _buildHeaders(),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Get upsell products for given items
  /// 
  /// Parameters:
  ///   - [payload]: List of item codes to get upsells for
  /// 
  /// Returns: Upsell products
  Future<Map<String, dynamic>> getUpSells(
      List<String> itemCodes) async {
    final payload = {
      'itemCodes': itemCodes,
    };

    final response = await http
        .post(
          Uri.parse('${baseUrl}StoreItems/Upsells'),
          headers: _buildHeaders(),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Get cross-sell products for given items
  /// 
  /// Parameters:
  ///   - [itemCodes]: List of item codes to get cross-sells for
  /// 
  /// Returns: Cross-sell products
  Future<Map<String, dynamic>> getCrossSells(
      List<String> itemCodes) async {
    final payload = {
      'itemCodes': itemCodes,
    };

    final response = await http
        .post(
          Uri.parse('${baseUrl}StoreItems/CrossSells'),
          headers: _buildHeaders(),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  // ==================== SHOPPING CART ====================

  /// Preview cart/validate cart items before checkout
  /// 
  /// Parameters:
  ///   - [cartItems]: List of items in cart
  /// 
  /// Returns: Cart preview with totals
  Future<Map<String, dynamic>> previewCart(
      List<Map<String, dynamic>> cartItems) async {
    final payload = {
      'items': cartItems,
    };

    final response = await http
        .post(
          Uri.parse('${baseUrl}StoreInvoices/Carts'),
          headers: _buildHeaders(),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  // ==================== ORDERS ====================

  /// Create an order (invoice)
  /// 
  /// Parameters:
  ///   - [cardCode]: Customer card code
  ///   - [items]: List of line items
  ///   - [deliveryAddress]: Delivery address details
  ///   - [comments]: Order comments
  /// 
  /// Returns: Created order details
  Future<Map<String, dynamic>> createOrder({
    required String cardCode,
    required List<Map<String, dynamic>> items,
    required Map<String, dynamic> deliveryAddress,
    String? comments,
  }) async {
    final payload = {
      'cardCode': cardCode,
      'documentLines': items,
      'deliveryAddress': deliveryAddress,
      if (comments != null) 'comments': comments,
    };

    final response = await http
        .post(
          Uri.parse('${baseUrl}StoreInvoices'),
          headers: _buildHeaders(),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Get orders/invoices for current user
  /// 
  /// Parameters:
  ///   - [pageSize]: Items per page
  ///   - [pageNumber]: Page number
  ///   - [filterExtension]: OData filter
  ///   - [queryExtension]: OData query
  /// 
  /// Returns: List of invoices
  Future<Map<String, dynamic>> getStoreInvoices({
    int pageSize = 20,
    int pageNumber = 1,
    String filterExtension = '',
    String queryExtension = '',
  }) async {
    final queryParams = {
      'queryExtension': queryExtension,
      'pageSize': pageSize.toString(),
      'pageNumber': pageNumber.toString(),
      'filterExtension': filterExtension,
    };

    final response = await http
        .get(
          Uri.parse('${baseUrl}StoreInvoices')
              .replace(queryParameters: queryParams),
          headers: _buildHeaders(),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Get single invoice/order details
  /// 
  /// Parameters:
  ///   - [docEntry]: Document entry number
  ///   - [selectExtension]: OData select extension
  /// 
  /// Returns: Invoice details
  Future<Map<String, dynamic>> getSingleInvoice({
    required int docEntry,
    String selectExtension = '',
  }) async {
    final queryParams = {
      'selectExtension': selectExtension,
    };

    final response = await http
        .get(
          Uri.parse('${baseUrl}StoreInvoices/$docEntry')
              .replace(queryParameters: queryParams),
          headers: _buildHeaders(),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  // ==================== PAYMENTS ====================

  /// Initiate payment with PayNow
  /// 
  /// Parameters:
  ///   - [invoiceDocEntry]: Invoice document entry
  ///   - [amount]: Payment amount
  ///   - [currency]: Currency code
  /// 
  /// Returns: Payment initiation response with redirect URL
  Future<Map<String, dynamic>> createOrderPayNow({
    required int invoiceDocEntry,
    required double amount,
    required String currency,
  }) async {
    final payload = {
      'docEntry': invoiceDocEntry,
      'amount': amount,
      'currency': currency,
    };

    final response = await http
        .post(
          Uri.parse('${baseUrl}StoreInvoices/PayNow/InitiatePayment'),
          headers: _buildHeaders(),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Check PayNow payment status
  /// 
  /// Parameters:
  ///   - [checkUrl]: PayNow provided check URL
  /// 
  /// Returns: Payment status
  Future<Map<String, dynamic>> checkPayNowTransaction(String checkUrl) async {
    final response = await http
        .get(
          Uri.parse(checkUrl),
          headers: _buildHeaders(),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Initiate payment with InnBucks
  /// 
  /// Parameters:
  ///   - [invoiceDocEntry]: Invoice document entry
  ///   - [amount]: Payment amount
  ///   - [currency]: Currency code
  /// 
  /// Returns: InnBucks payment code
  Future<Map<String, dynamic>> createOrderInnBucks({
    required int invoiceDocEntry,
    required double amount,
    required String currency,
  }) async {
    final payload = {
      'docEntry': invoiceDocEntry,
      'amount': amount,
      'currency': currency,
    };

    final response = await http
        .post(
          Uri.parse('${baseUrl}StoreInvoices/InnBucks/GetPaymentCode'),
          headers: _buildHeaders(),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Check InnBucks transaction status
  /// 
  /// Parameters:
  ///   - [innbucksCode]: InnBucks transaction code
  /// 
  /// Returns: Transaction status
  Future<Map<String, dynamic>> checkInnBucksTransaction(
      String innbucksCode) async {
    final payload = {
      'code': innbucksCode,
    };

    final response = await http
        .post(
          Uri.parse('${baseUrl}InnBucks/EnquireCode'),
          headers: _buildHeaders(),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Create incoming payment (fund wallet/account)
  /// 
  /// Parameters:
  ///   - [cardCode]: Customer card code
  ///   - [amount]: Payment amount
  ///   - [currency]: Currency code
  ///   - [reference]: Payment reference
  /// 
  /// Returns: Payment creation response
  Future<Map<String, dynamic>> createIncomingPayment({
    required String cardCode,
    required double amount,
    required String currency,
    String? reference,
  }) async {
    final payload = {
      'cardCode': cardCode,
      'amount': amount,
      'currency': currency,
      if (reference != null) 'reference': reference,
    };

    final response = await http
        .post(
          Uri.parse('${baseUrl}StoreIncomingPayments'),
          headers: _buildHeaders(),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Initiate incoming payment with PayNow
  /// 
  /// Parameters:
  ///   - [amount]: Payment amount
  ///   - [currency]: Currency code
  /// 
  /// Returns: PayNow payment code
  Future<Map<String, dynamic>> createIncomingPaymentPayNow({
    required double amount,
    required String currency,
  }) async {
    final payload = {
      'amount': amount,
      'currency': currency,
    };

    final response = await http
        .post(
          Uri.parse('${baseUrl}StoreIncomingPayments/PayNow/InitiatePayment'),
          headers: _buildHeaders(),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Initiate incoming payment with InnBucks
  /// 
  /// Parameters:
  ///   - [amount]: Payment amount
  ///   - [currency]: Currency code
  /// 
  /// Returns: InnBucks payment code
  Future<Map<String, dynamic>> createIncomingPaymentInnBucks({
    required double amount,
    required String currency,
  }) async {
    final payload = {
      'amount': amount,
      'currency': currency,
    };

    final response = await http
        .post(
          Uri.parse('${baseUrl}StoreIncomingPayments/InnBucks/GetPaymentCode'),
          headers: _buildHeaders(),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Get incoming payments list
  /// 
  /// Parameters:
  ///   - [pageSize]: Items per page
  ///   - [pageNumber]: Page number
  ///   - [filterExtension]: OData filter
  ///   - [queryExtension]: OData query
  /// 
  /// Returns: List of incoming payments
  Future<Map<String, dynamic>> getStoreIncomingPayments({
    int pageSize = 20,
    int pageNumber = 1,
    String filterExtension = '',
    String queryExtension = '',
  }) async {
    final queryParams = {
      'queryExtension': queryExtension,
      'pageSize': pageSize.toString(),
      'pageNumber': pageNumber.toString(),
      'filterExtension': filterExtension,
    };

    final response = await http
        .get(
          Uri.parse('${baseUrl}StoreIncomingPayments')
              .replace(queryParameters: queryParams),
          headers: _buildHeaders(),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Get single incoming payment details
  /// 
  /// Parameters:
  ///   - [docEntry]: Document entry number
  ///   - [selectExtension]: OData select extension
  /// 
  /// Returns: Payment details
  Future<Map<String, dynamic>> getSingleIncomingPayment({
    required int docEntry,
    String selectExtension = '',
  }) async {
    final queryParams = {
      'selectExtension': selectExtension,
    };

    final response = await http
        .get(
          Uri.parse('${baseUrl}StoreIncomingPayments/$docEntry')
              .replace(queryParameters: queryParams),
          headers: _buildHeaders(),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  // ==================== DELIVERY ====================

  /// Get delivery zones
  /// 
  /// Returns: List of delivery zones with locations
  Future<Map<String, dynamic>> getDeliveryZones() async {
    final response = await http
        .get(
          Uri.parse('${baseUrl}DeliveryZones/Locations'),
          headers: _buildHeaders(),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Get delivery zones without geolocation data
  /// 
  /// Returns: List of delivery places
  Future<Map<String, dynamic>> getDeliveryZonesPlaces() async {
    final response = await http
        .get(
          Uri.parse('${baseUrl}DeliveryZones/Places'),
          headers: _buildHeaders(),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  /// Get delivery charges/fees
  /// 
  /// Returns: List of delivery charges
  Future<Map<String, dynamic>> getDeliveryCharges() async {
    final response = await http
        .get(
          Uri.parse('${baseUrl}DeliveryCharges/ChooseLists'),
          headers: _buildHeaders(),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  // ==================== ACCOUNT STATEMENTS ====================

  /// Get business partner/customer statements
  /// 
  /// Parameters:
  ///   - [cardCode]: Customer card code
  ///   - [startDate]: Start date (ISO format)
  ///   - [endDate]: End date (ISO format)
  ///   - [currency]: Currency code (default 'Account')
  /// 
  /// Returns: Account statements
  Future<Map<String, dynamic>> getStoreStatements({
    required String cardCode,
    required DateTime startDate,
    required DateTime endDate,
    String currency = 'Account',
  }) async {
    final payload = {
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'currency': currency,
    };

    final response = await http
        .post(
          Uri.parse(
              '${baseUrl}StoreJournalEntries/BusinessPartners/$cardCode/GetStatements'),
          headers: _buildHeaders(),
          body: jsonEncode(payload),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  // ==================== CUSTOMER PROFILE ====================

  /// Get business partner/customer details
  /// 
  /// Parameters:
  ///   - [cardCode]: Customer card code
  ///   - [selectExtension]: OData select extension
  /// 
  /// Returns: Customer details
  Future<Map<String, dynamic>> getBusinessPartnerDetails({
    required String cardCode,
    String selectExtension = '',
  }) async {
    final queryParams = {
      'selectExtension': selectExtension,
    };

    final response = await http
        .get(
          Uri.parse('${baseUrl}StoreBusinessPartners/$cardCode')
              .replace(queryParameters: queryParams),
          headers: _buildHeaders(),
        )
        .timeout(timeout);

    return _handleResponse(response);
  }

  // ==================== DATA MODELS ====================
}

/// Login Response Model
class LoginResponse {
  final String token;
  final String tokenExpiry;
  final CustomerInfo customer;
  final String databaseName;
  final String warehouseCode;
  final List<String> roles;

  LoginResponse({
    required this.token,
    required this.tokenExpiry,
    required this.customer,
    required this.databaseName,
    required this.warehouseCode,
    required this.roles,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      token: json['token'] ?? '',
      tokenExpiry: json['tokenExpiry'] ?? '',
      customer: CustomerInfo.fromJson(json['customer'] ?? {}),
      databaseName: json['databaseName'] ?? '',
      warehouseCode: json['warehouseCode'] ?? '',
      roles: List<String>.from(json['roles'] ?? []),
    );
  }
}

/// Customer Information Model
class CustomerInfo {
  final String cardCode;
  final String cardName;
  final String currency;
  final String warehouse;
  final bool isVisitor;
  final String warehouseName;

  CustomerInfo({
    required this.cardCode,
    required this.cardName,
    required this.currency,
    required this.warehouse,
    required this.isVisitor,
    required this.warehouseName,
  });

  factory CustomerInfo.fromJson(Map<String, dynamic> json) {
    return CustomerInfo(
      cardCode: json['cardCode'] ?? '',
      cardName: json['cardName'] ?? '',
      currency: json['currency'] ?? '',
      warehouse: json['warehouse'] ?? '',
      isVisitor: json['isVisitor'] ?? false,
      warehouseName: json['warehouseName'] ?? '',
    );
  }
}

/// Product List Response Model
class ProductListResponse {
  final int recordCount;
  final int pageCount;
  final int pageNumber;
  final List<Product> products;

  ProductListResponse({
    required this.recordCount,
    required this.pageCount,
    required this.pageNumber,
    required this.products,
  });

  factory ProductListResponse.fromJson(Map<String, dynamic> json) {
    return ProductListResponse(
      recordCount: json['recordCount'] ?? 0,
      pageCount: json['pageCount'] ?? 0,
      pageNumber: json['pageNumber'] ?? 1,
      products: (json['values'] as List<dynamic>?)
              ?.map((p) => Product.fromJson(p as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

/// Product Model
class Product {
  final String itemCode;
  final String itemName;
  final String image;
  final List<String> pictures;
  final int defaultSalesUoMEntry;
  final String defaultSalesUoMName;
  final double price;
  final String currency;
  final String salesVATGroup;
  final double salesVATRate;
  final String warehouseCode;
  final double unitsOnStock;
  final double storeUnitPrice;
  final int itemsGroupCode;
  final List<UnitOfMeasure> uoMs;
  final String? description;

  Product({
    required this.itemCode,
    required this.itemName,
    required this.image,
    required this.pictures,
    required this.defaultSalesUoMEntry,
    required this.defaultSalesUoMName,
    required this.price,
    required this.currency,
    required this.salesVATGroup,
    required this.salesVATRate,
    required this.warehouseCode,
    required this.unitsOnStock,
    required this.storeUnitPrice,
    required this.itemsGroupCode,
    required this.uoMs,
    this.description,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      itemCode: json['itemCode'] ?? '',
      itemName: json['itemName'] ?? '',
      image: json['image'] ?? '',
      pictures: List<String>.from(json['pictures'] ?? []),
      defaultSalesUoMEntry: json['defaultSalesUoMEntry'] ?? 0,
      defaultSalesUoMName: json['defaultSalesUoMName'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] ?? '',
      salesVATGroup: json['salesVATGroup'] ?? '',
      salesVATRate: (json['salesVATRate'] as num?)?.toDouble() ?? 0.0,
      warehouseCode: json['warehouseCode'] ?? '',
      unitsOnStock: (json['unitsOnStock'] as num?)?.toDouble() ?? 0.0,
      storeUnitPrice: (json['storeUnitPrice'] as num?)?.toDouble() ?? 0.0,
      itemsGroupCode: json['itemsGroupCode'] ?? 0,
      uoMs: (json['uoMs'] as List<dynamic>?)
              ?.map((u) => UnitOfMeasure.fromJson(u as Map<String, dynamic>))
              .toList() ??
          [],
      description: json['u_ONA_Description'],
    );
  }
}

/// Unit of Measure Model
class UnitOfMeasure {
  final int uomEntry;
  final String uomName;
  final double price;
  final double inStock;
  final double inventoryQuantityFactor;
  final String currency;
  final bool isPricingUOM;
  final bool isInventoryUOM;
  final double uomQuantity;

  UnitOfMeasure({
    required this.uomEntry,
    required this.uomName,
    required this.price,
    required this.inStock,
    required this.inventoryQuantityFactor,
    required this.currency,
    required this.isPricingUOM,
    required this.isInventoryUOM,
    required this.uomQuantity,
  });

  factory UnitOfMeasure.fromJson(Map<String, dynamic> json) {
    return UnitOfMeasure(
      uomEntry: json['uomEntry'] ?? 0,
      uomName: json['uomName'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      inStock: (json['inStock'] as num?)?.toDouble() ?? 0.0,
      inventoryQuantityFactor:
          (json['inventoryQuantityFactor'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] ?? '',
      isPricingUOM: json['isPricingUOM'] ?? false,
      isInventoryUOM: json['isInventoryOM'] ?? false,
      uomQuantity: (json['uomQuantity'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() => {
        'uomEntry': uomEntry,
        'uomName': uomName,
        'price': price,
        'inStock': inStock,
        'inventoryQuantityFactor': inventoryQuantityFactor,
        'currency': currency,
        'isPricingUOM': isPricingUOM,
        'isInventoryOM': isInventoryUOM,
        'uomQuantity': uomQuantity,
      };
}

/// Cart Item Model
class CartItem {
  final String itemCode;
  final String itemName;
  final int quantity;
  final UnitOfMeasure uom;
  final double subtotal;

  CartItem({
    required this.itemCode,
    required this.itemName,
    required this.quantity,
    required this.uom,
  }) : subtotal = (uom.price * quantity);

  Map<String, dynamic> toJson() => {
        'itemCode': itemCode,
        'itemName': itemName,
        'quantity': quantity,
        'uom': uom.toJson(),
        'subtotal': subtotal,
      };
}

/// Delivery Address Model
class DeliveryAddress {
  final String? firstName;
  final String? lastName;
  final String streetAddress;
  final String city;
  final String? state;
  final String postalCode;
  final String? phoneNumber;
  final double? latitude;
  final double? longitude;
  final String? instructions;

  DeliveryAddress({
    this.firstName,
    this.lastName,
    required this.streetAddress,
    required this.city,
    this.state,
    required this.postalCode,
    this.phoneNumber,
    this.latitude,
    this.longitude,
    this.instructions,
  });

  Map<String, dynamic> toJson() => {
        'firstName': firstName,
        'lastName': lastName,
        'streetAddress': streetAddress,
        'city': city,
        'state': state,
        'postalCode': postalCode,
        'phoneNumber': phoneNumber,
        'latitude': latitude,
        'longitude': longitude,
        'instructions': instructions,
      };
}

// ==================== EXCEPTION CLASSES ====================

/// Base API Exception
class ApiException implements Exception {
  final String message;
  ApiException(this.message);

  @override
  String toString() => message;
}

/// Unauthorized access exception
class UnauthorizedException extends ApiException {
  UnauthorizedException(super.message);
}

/// Resource not found exception
class NotFoundException extends ApiException {
  NotFoundException(super.message);
}

/// Bad request exception
class BadRequestException extends ApiException {
  BadRequestException(super.message);
}

/// Server error exception
class ServerException extends ApiException {
  ServerException(super.message);
}

/// Network timeout exception
class TimeoutException extends ApiException {
  TimeoutException(String message)
      : super('Request timeout: $message');
}
