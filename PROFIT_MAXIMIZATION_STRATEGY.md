# Platform Profit Maximization Strategy

## Current Commission Structure

| Category | Current Rate | Platform Take |
|----------|-------------|---------------|
| **Events** | 10% percentage | ₹100 per ₹1,000 sale |
| **Learning** | 12% percentage | ₹120 per ₹1,000 sale |
| **Jobs** | Fixed ₹499 | Fixed per job posting |
| **Default Products** | Implicit 60/40 split | Seller gets 60%, platform 40% |

## Profit Maximization Recommendations

### 1. Tiered Commission Structure
- **New sellers**: Higher commission rates (15% learning, 12% events) until reaching sales thresholds
- **Established sellers**: Reduced rates (10% learning) after hitting revenue targets
- **Implementation**: Add `sellerTier` field to User model, auto-promote based on `settlement.totalSales`

### 2. Dynamic Pricing by Product Type
| Product Type | Recommended Commission | Rationale |
|-------------|----------------------|-----------|
| Rentable products | 8-10% | Encourage rentals over purchases (higher volume) |
| Fixed-price products | 12% | Standard rate, balanced margin |
| Premium/featured products | 15-20% | Higher value, includes featured listing fee |

### 3. Platform Fee Upsells
- **Express payouts**: 2-3% fee for immediate withdrawals (vs. standard 5-7 day)
- **Featured listings**: ₹299-499 one-time fee for product highlighting in catalog
- **Zero-commission weeks**: Occasional promotions that increase volume (platform gains through higher transaction count)

### 4. Seller Subscription Tiers
| Tier | Commission | Features | Price |
|------|------------|----------|-------|
| **Basic** | 12% | Standard payouts, basic analytics | Free |
| **Pro** | 8% | Faster payouts, analytics dashboard, priority support | ₹499/month |
| **Enterprise** | Negotiated | Dedicated account manager, custom integration | Custom |

### 5. Job Poster Premium Features
- Current: Fixed ₹499 job posting fee
- Add: ₹999 for featured job visibility (30 days)
- Add: ₹1499 for "urgent" priority listing
- Add: 5% revenue share on hired candidates (first-year salary)

### 6. GST/Tax Optimization
- Currently 18% GST on commissions (hardcoded in schemas)
- Consider GST-exempt thresholds or consolidated billing for high-volume sellers
- Platform could absorb partial GST to make pricing more competitive

### 7. Cross-Platform Revenue
- When instructor creates course → also list as product in seller portal
- Revenue sharing: 70/30 split between academy and platform
- SSO grants (`SsoGrant`) enable seamless account migration with transaction history

### 8. Reducing Revenue Leakage
- **Auto-commission deduction**: Ensure every payment automatically creates settlement record
- **Pending payouts aging**: After 30 days pending → auto-escalate to admin for processing
- **Minimum withdrawal threshold**: ₹500 minimum to reduce small-transaction costs

## Expected Revenue Impact

| Change | Estimated Monthly Impact |
|--------|-------------------------|
| Learning commission 12% → 15% | +25% on learning sales |
| Featured listings at ₹299 | ₹50K-2L/month (depends on adoption) |
| Seller tier promotion | +10% retention → more long-term volume |
| Express payout 2% fee | ₹20K-1L/month (depends on usage) |
| Job poster premium features | ₹30K-5L/month (depends on job volume) |

## Implementation Priority

1. **Immediate** (1-2 weeks):
   - Increase learning commission from 12% → 15%
   - Add featured product fees in admin settings
   - Implement express payout fee option

2. **Short-term** (1 month):
   - Introduce seller tiers based on order count
   - Add job poster premium features
   - Update commission rule defaults

3. **Long-term** (2-3 months):
   - Build subscription tier system
   - Implement cross-platform revenue sharing
   - Create dynamic pricing engine based on product type

## Key Balance Considerations

- **Don't price sellers out**: Keep commissions competitive vs. market rates
- **Volume over margin**: Small commission reductions can increase seller volume significantly
- **Transparency**: Clearly display commission breakdowns in seller dashboards (already done in `/earnings/page.tsx`)
- **Automation**: Auto-deduct commissions at payment verification time (already in `paymentRoutes.js` create-order flow)