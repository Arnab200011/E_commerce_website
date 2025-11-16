# E-Commerce Backend & Database Flowchart

## Complete System Architecture Diagram (Mermaid)

```mermaid
graph TD
    subgraph "Client Layer"
        A[React Frontend<br/>Port: 5173]
        A1[Redux Store<br/>Cart State]
        A2[LocalStorage<br/>Access Token]
    end

    subgraph "Backend Services"
        B[Express Auth Server<br/>Port: 5000]
        C[FastAPI Chatbot<br/>Port: 8000]
    end

    subgraph "Database Layer"
        D[(MongoDB Atlas<br/>Cloud Database)]
        D1[Users Collection]
        D2[Products Collection]
        D3[Orders Collection]
        D4[FAISS Vector Store<br/>QA Knowledge Base]
    end

    subgraph "Auth System Flow"
        E[POST /api/auth/register]
        F[POST /api/auth/login]
        G[POST /api/auth/refresh-token]
        H[GET /api/auth/profile]
        I[POST /api/auth/logout]
        J[POST /api/auth/logout-all]
        K[GET /api/admin/users]
    end

    subgraph "Authentication Processing"
        L{Validate Input}
        M{User Exists?}
        N[Hash Password<br/>bcrypt - 12 rounds]
        O[Create User Document]
        P[Generate JWT Pair]
        Q[Save Refresh Token<br/>to DB]
        R[Set HTTP-Only Cookie]
        S[Return Access Token]
    end

    subgraph "Middleware Layer"
        T[Auth Middleware<br/>JWT Verification]
        U[Role Middleware<br/>Admin/User/Moderator]
        V[Auto-Refresh Middleware<br/>Token Rotation]
        W[Validation Middleware<br/>express-validator]
    end

    subgraph "Token Management"
        X[Access Token<br/>Expiry: 15 min<br/>Header: Bearer]
        Y[Refresh Token<br/>Expiry: 7 days<br/>Cookie: HTTP-Only]
        Z{Token Valid?}
    end

    subgraph "Chatbot Flow"
        CB1[POST /chat]
        CB2{Has Context?}
        CB3[Order Tracking]
        CB4[Product Inquiry]
        CB5[FAISS Similarity Search]
        CB6[MongoDB Query]
        CB7[Return AI Response]
    end

    subgraph "E-commerce Flow (Mock)"
        EC1[Product Catalog<br/>Frontend Mock]
        EC2[Shopping Cart<br/>Redux State]
        EC3[Order Creation<br/>Frontend Mock]
        EC4[Order Management<br/>Frontend Mock]
    end

    %% Frontend to Backend Connections
    A -->|HTTP Requests| B
    A -->|Chat Messages| C
    A1 --> A
    A2 --> A

    %% Auth Endpoints
    A -->|Register Request| E
    A -->|Login Request| F
    A -->|Auto Refresh| G
    A -->|Protected Route| H
    A -->|Logout Single| I
    A -->|Logout All| J
    A -->|Admin Request| K

    %% Registration Flow
    E --> L
    L -->|Valid| M
    M -->|No| N
    N --> O
    O --> P
    P --> Q
    Q --> R
    R --> S
    S --> A2
    M -->|Yes| A

    %% Login Flow
    F --> L
    L -->|Valid| M
    M -->|Yes| P
    P --> Q
    Q --> R
    R --> S

    %% Middleware Protection
    H --> T
    K --> T
    I --> T
    J --> T
    T --> Z
    Z -->|Valid| H
    Z -->|Invalid| A
    K --> U
    U -->|Authorized| D1

    %% Token Refresh Flow
    G --> V
    V --> Y
    Y --> Z
    Z -->|Valid Refresh| P

    %% Database Connections
    B -->|Mongoose ORM| D
    O --> D1
    Q --> D1
    P --> D1
    C -->|PyMongo| D

    %% Chatbot Processing
    C --> CB1
    CB1 --> CB2
    CB2 -->|Yes - Order| CB3
    CB2 -->|Yes - Product| CB4
    CB2 -->|No Context| CB5
    CB3 --> CB6
    CB4 --> CB6
    CB5 --> D4
    CB6 --> D2
    CB3 --> D3
    CB5 --> CB7
    CB6 --> CB7
    CB7 --> A

    %% E-commerce Mock Flows
    A --> EC1
    EC1 --> EC2
    EC2 --> EC3
    EC3 --> EC4
    EC4 --> A1

    %% Database Collections
    D --> D1
    D --> D2
    D --> D3

    style A fill:#e1f5ff
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style D1 fill:#c8e6c9
    style D2 fill:#c8e6c9
    style D3 fill:#c8e6c9
    style X fill:#ffccbc
    style Y fill:#ffccbc
    style T fill:#ffe0b2
    style U fill:#ffe0b2
    style V fill:#ffe0b2
```

## User Registration & Login Flow (Detailed)

```mermaid
flowchart TD
    Start([User Visits Site]) --> Choice{Action}

    Choice -->|Register| R1[Fill Registration Form]
    Choice -->|Login| L1[Fill Login Form]

    subgraph "Registration Process"
        R1 --> R2[Submit: username, email, password, role]
        R2 --> R3[Express Validator<br/>Validation Rules]
        R3 --> R4{Valid Input?}
        R4 -->|No| R5[Return 400 Error]
        R4 -->|Yes| R6[Check User Exists<br/>Query MongoDB]
        R6 --> R7{User Found?}
        R7 -->|Yes| R8[Return 409 Conflict]
        R7 -->|No| R9[Create User Object]
        R9 --> R10[Pre-Save Hook Triggered]
        R10 --> R11[bcrypt.hash password<br/>Salt rounds: 12]
        R11 --> R12[Save to Users Collection]
        R12 --> R13[Generate Access Token<br/>JWT Secret: JWT_SECRET<br/>Expiry: 15min]
        R13 --> R14[Generate Refresh Token<br/>JWT Secret: JWT_REFRESH_SECRET<br/>Expiry: 7 days]
        R14 --> R15[Push Refresh Token to<br/>user.refreshTokens array]
        R15 --> R16[Update User in MongoDB]
        R16 --> R17[Set HTTP-Only Cookie<br/>Name: refreshToken<br/>Secure: true in prod]
        R17 --> R18[Return Response:<br/>accessToken + user data]
        R18 --> R19[Frontend: Store Access Token<br/>in localStorage]
        R19 --> Success([User Registered])
    end

    subgraph "Login Process"
        L1 --> L2[Submit: email, password]
        L2 --> L3[Validate Input]
        L3 --> L4{Valid?}
        L4 -->|No| L5[Return 400 Error]
        L4 -->|Yes| L6[Find User by Email]
        L6 --> L7{User Found?}
        L7 -->|No| L8[Return 401 Unauthorized]
        L7 -->|Yes| L9{isActive == true?}
        L9 -->|No| L10[Return 401<br/>Account Deactivated]
        L9 -->|Yes| L11[user.comparePassword method]
        L11 --> L12[bcrypt.compare<br/>input vs hashed password]
        L12 --> L13{Password Match?}
        L13 -->|No| L14[Return 401 Unauthorized]
        L13 -->|Yes| L15[Generate JWT Pair]
        L15 --> L16[Save Refresh Token to DB]
        L16 --> L17[Set HTTP-Only Cookie]
        L17 --> L18[Return Access Token + User]
        L18 --> L19[Store Access Token]
        L19 --> Success2([User Logged In])
    end

    R5 --> End([End])
    R8 --> End
    L5 --> End
    L8 --> End
    L10 --> End
    L14 --> End
    Success --> End
    Success2 --> End

    style R3 fill:#ffe0b2
    style R11 fill:#ffccbc
    style R13 fill:#c8e6c9
    style R14 fill:#c8e6c9
    style L11 fill:#ffccbc
    style L12 fill:#ffccbc
    style R17 fill:#f8bbd0
    style L17 fill:#f8bbd0
```

## Protected Route Access & Token Refresh Flow

```mermaid
flowchart TD
    Start([User Makes Request]) --> Check{Request Type}

    Check -->|Protected Route| P1[GET /api/auth/profile]
    Check -->|Admin Route| A1[GET /api/admin/users]
    Check -->|Refresh Token| T1[POST /api/auth/refresh-token]

    subgraph "Protected Route Flow"
        P1 --> P2[Auth Middleware Triggered]
        P2 --> P3[Extract Authorization Header]
        P3 --> P4{Header Format:<br/>Bearer token?}
        P4 -->|No| P5[Return 401<br/>No token provided]
        P4 -->|Yes| P6[Extract JWT Token]
        P6 --> P7[jwt.verify token<br/>Secret: JWT_SECRET]
        P7 --> P8{Token Valid?}
        P8 -->|No - Expired| P9[Return 401<br/>Token expired]
        P8 -->|No - Invalid| P10[Return 401<br/>Invalid token]
        P8 -->|Yes| P11[Extract user.id from payload]
        P11 --> P12[Query User by ID<br/>MongoDB: Users collection]
        P12 --> P13{User Found?}
        P13 -->|No| P14[Return 401<br/>User not found]
        P13 -->|Yes| P15{user.isActive?}
        P15 -->|No| P16[Return 401<br/>Account inactive]
        P15 -->|Yes| P17[Attach req.user = user]
        P17 --> P18[Execute Route Handler]
        P18 --> P19[Return User Profile Data]
        P19 --> Success1([Success])
    end

    subgraph "Admin Route Flow"
        A1 --> A2[Auth Middleware]
        A2 --> A3[Verify JWT - Same as P2-P17]
        A3 --> A4[Role Middleware Triggered]
        A4 --> A5{req.user.role in<br/>allowed roles?}
        A5 -->|No| A6[Return 403<br/>Insufficient permissions]
        A5 -->|Yes - Admin| A7[Execute Admin Handler]
        A7 --> A8[Query All Users from MongoDB]
        A8 --> A9[Return Users List]
        A9 --> Success2([Success])
    end

    subgraph "Token Refresh Flow"
        T1 --> T2[Extract Cookie: refreshToken]
        T2 --> T3{Cookie Exists?}
        T3 -->|No| T4[Return 401<br/>No refresh token]
        T3 -->|Yes| T5[jwt.verify refreshToken<br/>Secret: JWT_REFRESH_SECRET]
        T5 --> T6{Token Valid?}
        T6 -->|No| T7[Return 401<br/>Invalid refresh token]
        T6 -->|Yes| T8[Extract user.id from payload]
        T8 --> T9[Find User in MongoDB]
        T9 --> T10{User Found?}
        T10 -->|No| T11[Return 401<br/>User not found]
        T10 -->|Yes| T12{Token in user.refreshTokens<br/>array?}
        T12 -->|No| T13[Return 401<br/>Token revoked/invalid]
        T12 -->|Yes| T14[Generate New Access Token<br/>Expiry: 15min]
        T14 --> T15[Generate New Refresh Token<br/>Expiry: 7 days]
        T15 --> T16[MongoDB: $pull old token<br/>from refreshTokens array]
        T16 --> T17[MongoDB: $push new token<br/>to refreshTokens array]
        T17 --> T18[Set New HTTP-Only Cookie]
        T18 --> T19[Return New Access Token]
        T19 --> T20[Frontend: Update localStorage]
        T20 --> Success3([Tokens Refreshed])
    end

    subgraph "Frontend Auto-Refresh"
        F1[API Request Returns 401]
        F2[Axios Interceptor Catches]
        F3[Call /refresh-token API]
        F4{Refresh Success?}
        F4 -->|Yes| F5[Retry Original Request<br/>with new token]
        F4 -->|No| F6[Logout User<br/>Redirect to Login]
        F5 --> F7[Return Response to App]

        F1 --> F2
        F2 --> F3
        F3 --> T1
        Success3 --> F4
    end

    P5 --> End([End])
    P9 --> F1
    P10 --> End
    P14 --> End
    P16 --> End
    A6 --> End
    T4 --> End
    T7 --> End
    T11 --> End
    T13 --> End
    Success1 --> End
    Success2 --> End
    F6 --> End
    F7 --> End

    style P7 fill:#c8e6c9
    style T5 fill:#c8e6c9
    style T14 fill:#b2dfdb
    style T15 fill:#b2dfdb
    style T18 fill:#f8bbd0
    style A4 fill:#ffe0b2
    style F2 fill:#fff9c4
```

## Chatbot Integration Flow

```mermaid
flowchart TD
    Start([User Opens Chat]) --> Input[User Types Message]
    Input --> Send[POST /chat<br/>Body: user_id, message]

    Send --> CB1[FastAPI Chatbot Receives Request]
    CB1 --> CB2{User Has<br/>Active Context?}

    subgraph "Order Tracking Context"
        OT1[Context: order_tracking]
        OT2[Extract Order ID from Message<br/>Regex: order #123]
        OT3[MongoDB Query:<br/>db.Orders.find]
        OT4{Order Found?}
        OT4 -->|Yes| OT5[Format Order Status Response:<br/>status, items, total, shipping]
        OT4 -->|No| OT6[Return: Order not found message]
        OT5 --> Response
        OT6 --> Response
    end

    subgraph "Product Inquiry Context"
        PI1[Context: product_inquiry]
        PI2[Extract Product Name from Message]
        PI3[MongoDB Query:<br/>db.Products.find<br/>name, price, description, stock]
        PI4{Product Found?}
        PI4 -->|Yes| PI5[Format Product Info Response]
        PI4 -->|No| PI6[Return: Product not available]
        PI5 --> Response
        PI6 --> Response
    end

    subgraph "No Context - General Query"
        NC1[No Active Context]
        NC2[Load FAISS Vector Store<br/>QAstore/index.faiss]
        NC3[HuggingFace Embeddings<br/>Model: all-MiniLM-L6-v2]
        NC4[Convert Message to Vector Embedding]
        NC5[FAISS Similarity Search<br/>Find closest Q&A match]
        NC6{Match Found?}
        NC6 -->|Yes| NC7[Retrieve Stored Answer]
        NC6 -->|No| NC8[Default Response:<br/>Ask for clarification]
        NC7 --> NC9{Answer Contains<br/>Context Trigger?}
        NC9 -->|Track Order| NC10[Set Context: order_tracking]
        NC9 -->|Product Info| NC11[Set Context: product_inquiry]
        NC9 -->|No| NC12[Return Answer]
        NC10 --> Response
        NC11 --> Response
        NC12 --> Response
        NC8 --> Response
    end

    CB2 -->|order_tracking| OT1
    CB2 -->|product_inquiry| PI1
    CB2 -->|None| NC1

    OT1 --> OT2
    OT2 --> OT3
    OT3 --> OT4

    PI1 --> PI2
    PI2 --> PI3
    PI3 --> PI4

    NC1 --> NC2
    NC2 --> NC3
    NC3 --> NC4
    NC4 --> NC5
    NC5 --> NC6

    Response[Return JSON Response] --> Display[Display in Chat UI]
    Display --> End([End])

    style CB1 fill:#f3e5f5
    style NC2 fill:#e1bee7
    style NC3 fill:#ce93d8
    style NC5 fill:#ba68c8
    style OT3 fill:#c8e6c9
    style PI3 fill:#c8e6c9
```

## Database Schema & Collections

```mermaid
erDiagram
    USERS ||--o{ REFRESH_TOKENS : contains
    USERS {
        ObjectId _id PK
        string username UK "min:3, max:30"
        string email UK "lowercase, validated"
        string password "bcrypt hashed"
        enum role "user|admin|moderator"
        boolean isActive "default: true"
        array refreshTokens "embedded documents"
        date createdAt "auto-generated"
        date updatedAt "auto-generated"
    }

    REFRESH_TOKENS {
        string token "JWT string"
        date createdAt "default: now"
        number expires "TTL: 604800 sec (7 days)"
    }

    PRODUCTS {
        ObjectId _id PK
        string name
        number price
        string description
        number stock
        string category
        string brand
        array images
        number rating
        number reviewCount
    }

    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--|| SHIPPING_ADDRESS : has
    ORDERS }o--|| USERS : placed_by
    ORDERS {
        ObjectId _id PK
        ObjectId userId FK
        object shippingAddress "embedded"
        string paymentMethod
        number subtotal
        number shipping
        number tax
        number total
        string status "pending|shipped|delivered"
        date createdAt
        date updatedAt
    }

    ORDER_ITEMS {
        ObjectId productId FK
        string name
        number price
        string image
        number quantity
        string color
        string size
    }

    SHIPPING_ADDRESS {
        string firstName
        string lastName
        string address1
        string city
        string state
        string zipCode
        string country
        string phone
    }

    style USERS fill:#c8e6c9
    style REFRESH_TOKENS fill:#a5d6a7
    style PRODUCTS fill:#fff9c4
    style ORDERS fill:#ffccbc
    style ORDER_ITEMS fill:#ffab91
    style SHIPPING_ADDRESS fill:#ffab91
```

## Logout Flow (Single & All Devices)

```mermaid
flowchart TD
    Start([User Clicks Logout]) --> Choice{Logout Type}

    subgraph "Single Device Logout"
        S1[POST /api/auth/logout]
        S2[Auth Middleware:<br/>Verify Access Token]
        S3[Extract Refresh Token<br/>from HTTP-Only Cookie]
        S4{Cookie Exists?}
        S4 -->|Yes| S5[MongoDB Update:<br/>db.users.updateOne]
        S5 --> S6[Operation: $pull<br/>Remove token from refreshTokens array]
        S6 --> S7[Clear Refresh Token Cookie<br/>maxAge: 0]
        S7 --> S8[Return Success Response]
        S8 --> S9[Frontend: Clear Access Token<br/>from localStorage]
        S9 --> S10[Redirect to Login Page]
        S10 --> Success1([Logged Out - This Device])
        S4 -->|No| S7
    end

    subgraph "All Devices Logout"
        A1[POST /api/auth/logout-all]
        A2[Auth Middleware:<br/>Verify Access Token]
        A3[MongoDB Update:<br/>db.users.updateOne]
        A4[Operation: $set<br/>refreshTokens: empty array]
        A5[Clear Current Device Cookie]
        A6[Return Success Response]
        A7[Frontend: Clear Access Token]
        A8[Redirect to Login Page]
        A8 --> Success2([Logged Out - All Devices])

        Note1[All other devices will be<br/>logged out on next refresh attempt]
    end

    Choice -->|Single Device| S1
    Choice -->|All Devices| A1

    S1 --> S2
    S2 --> S3
    S3 --> S4

    A1 --> A2
    A2 --> A3
    A3 --> A4
    A4 --> A5
    A5 --> A6
    A6 --> A7
    A7 --> A8

    Success1 --> End([End])
    Success2 --> Note1
    Note1 --> End

    style S6 fill:#ffccbc
    style A4 fill:#ef9a9a
    style S7 fill:#f8bbd0
    style A5 fill:#f8bbd0
```

## Shopping Cart & Order Creation Flow (Frontend Mock)

```mermaid
flowchart TD
    Start([User Browses Products]) --> View[Click Product]
    View --> Detail[View Product Details]
    Detail --> Select{Select Options}

    Select -->|Color| C1[Choose Color]
    Select -->|Size| S1[Choose Size if applicable]
    C1 --> Add
    S1 --> Add
    Select -->|Default| Add

    Add[Click Add to Cart] --> Cart1[Dispatch: addToCart action]
    Cart1 --> Redux1[Redux: cartSlice]

    subgraph "Cart Management (Redux)"
        Redux1 --> Check{Item Exists?<br/>Same id+color+size}
        Check -->|Yes| Update[Update Quantity:<br/>quantity++]
        Check -->|No| New[Add New Item to items array]
        Update --> Calc
        New --> Calc
        Calc[Calculate Totals:<br/>sum of item.price * quantity]
        Calc --> Store1[Update State:<br/>items, total, itemCount]
        Store1 --> LS1[Save to localStorage:<br/>key: 'cart']
    end

    LS1 --> Display[Show Cart Badge<br/>itemCount]
    Display --> Continue{User Action}

    Continue -->|Keep Shopping| Start
    Continue -->|View Cart| Cart2[Open Cart Sidebar]

    subgraph "Cart Review"
        Cart2 --> Review[Display All Items:<br/>name, price, quantity, total]
        Review --> Modify{Modify Cart?}
        Modify -->|Change Qty| UpdateQty[Dispatch: updateQuantity]
        Modify -->|Remove| Remove[Dispatch: removeFromCart]
        Modify -->|Clear All| Clear[Dispatch: clearCart]
        UpdateQty --> Calc
        Remove --> Calc
        Clear --> Empty[Set items: empty array]
        Empty --> LS1
        Modify -->|Checkout| Checkout
    end

    Checkout[Click Checkout] --> Shipping[Fill Shipping Form]

    subgraph "Order Creation"
        Shipping --> ShipData[Collect:<br/>firstName, lastName, address<br/>city, state, zip, country, phone]
        ShipData --> Payment[Select Payment Method]
        Payment --> Calculate[Calculate Order Totals]
        Calculate --> Sub[Subtotal: sum of cart items]
        Sub --> Ship[Shipping:<br/>$9.99 or FREE if subtotal > $100]
        Ship --> Tax[Tax: subtotal * 0.08]
        Tax --> Total[Total: subtotal + shipping + tax]
        Total --> Create[orderService.createOrder]
        Create --> Mock[Mock API Call<br/>Frontend Only - No Backend]
        Mock --> Order[Create Order Object]
        Order --> Save[Save to Mock Orders Array]
        Save --> ClearCart[Dispatch: clearCart]
        ClearCart --> Confirm[Redirect to Order Confirmation]
    end

    Confirm --> Success([Order Placed])

    Continue -->|Close| End([End])
    Success --> End

    style Redux1 fill:#e1bee7
    style Calc fill:#ce93d8
    style LS1 fill:#fff9c4
    style Mock fill:#ffccbc
    style Create fill:#ffab91
```

## Technology Stack Summary

```mermaid
graph LR
    subgraph "Frontend"
        F1[React 18.x]
        F2[Vite Build Tool]
        F3[Redux Toolkit<br/>State Management]
        F4[React Router<br/>Navigation]
        F5[Axios<br/>HTTP Client]
        F6[TailwindCSS<br/>Styling]
    end

    subgraph "Backend - Auth System"
        B1[Node.js Runtime]
        B2[Express 5.1.0<br/>Web Framework]
        B3[Mongoose 8.17.0<br/>MongoDB ODM]
        B4[jsonwebtoken 9.0.2<br/>JWT Auth]
        B5[bcrypt 6.0.0<br/>Password Hashing]
        B6[express-validator 7.2.1<br/>Input Validation]
        B7[cookie-parser 1.4.7<br/>Cookie Management]
        B8[cors<br/>Cross-Origin]
    end

    subgraph "Backend - Chatbot"
        C1[Python FastAPI<br/>Web Framework]
        C2[PyMongo<br/>MongoDB Driver]
        C3[LangChain<br/>AI Framework]
        C4[HuggingFace<br/>all-MiniLM-L6-v2]
        C5[FAISS<br/>Vector Similarity]
        C6[Uvicorn<br/>ASGI Server]
    end

    subgraph "Database"
        D1[MongoDB Atlas<br/>Cloud Database]
        D2[Users Collection]
        D3[Products Collection]
        D4[Orders Collection]
    end

    subgraph "Security"
        S1[JWT Dual-Token System]
        S2[HTTP-Only Cookies]
        S3[bcrypt Password Hashing]
        S4[CORS Protection]
        S5[Input Validation]
        S6[Role-Based Access Control]
    end

    F1 --> F5
    F3 --> F1
    F4 --> F1
    F5 --> B2
    F5 --> C1

    B2 --> B3
    B2 --> B4
    B2 --> B5
    B2 --> B6
    B2 --> B7
    B2 --> B8
    B3 --> D1

    C1 --> C2
    C1 --> C3
    C3 --> C4
    C3 --> C5
    C2 --> D1

    D1 --> D2
    D1 --> D3
    D1 --> D4

    B4 --> S1
    B7 --> S2
    B5 --> S3
    B8 --> S4
    B6 --> S5

    style F1 fill:#61dafb
    style B2 fill:#68a063
    style C1 fill:#009688
    style D1 fill:#4caf50
    style S1 fill:#ff9800
```

---

## How to View This Flowchart

1. **Copy the Mermaid code** from any diagram above
2. **Paste into Mermaid Live Editor**: https://mermaid.live
3. **Or use in Markdown viewers** that support Mermaid (GitHub, GitLab, VS Code with Mermaid extension)
4. **Or integrate into documentation** tools like Docusaurus, MkDocs, Notion

## Notes

- **Implemented Features**: Authentication system is fully functional with JWT, MongoDB, and secure cookie management
- **Mock Features**: Products, Orders, and Shopping Cart are frontend-only (no backend API)
- **Database**: MongoDB Atlas cloud database with Mongoose ORM
- **Security**: Production-ready auth with bcrypt, JWT dual-token, HTTP-only cookies, and role-based access
- **Missing**: Payment integration, product/order APIs, email verification, password reset
