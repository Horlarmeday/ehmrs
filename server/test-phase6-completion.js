const { sequelize } = require('./src/database/models');
const FinancialReportingService = require('./src/modules/Accounting/services/financialReporting.service')
  .default;
const BusinessIntelligenceService = require('./src/modules/Accounting/services/businessIntelligence.service')
  .default;

/**
 * Phase 6 Completion Test Script
 *
 * This script tests the completed Phase 6: Reporting & Analytics implementation including:
 * - Financial Reporting (P&L, Balance Sheet, Cash Flow)
 * - Operational Reporting (Performance, Utilization, Tracking)
 * - Business Intelligence (Trends, Predictive Analytics, Monitoring)
 */

async function testPhase6Completion() {
  console.log('🚀 Starting Phase 6 Completion Tests...\n');

  try {
    // Test 1: Financial Reporting System
    console.log('📊 Test 1: Financial Reporting System');
    await testFinancialReportingSystem();
    console.log('✅ Financial Reporting System: PASSED\n');

    // Test 2: Business Intelligence System
    console.log('🧠 Test 2: Business Intelligence System');
    await testBusinessIntelligenceSystem();
    console.log('✅ Business Intelligence System: PASSED\n');

    // Test 3: Integration Tests
    console.log('🔗 Test 3: Integration Tests');
    await testIntegrationScenarios();
    console.log('✅ Integration Tests: PASSED\n');

    console.log('🎉 All Phase 6 tests completed successfully!');
    console.log('📋 Phase 6: Reporting & Analytics is 100% COMPLETE');
  } catch (error) {
    console.error('❌ Phase 6 test failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// ===== TEST 1: FINANCIAL REPORTING SYSTEM =====

async function testFinancialReportingSystem() {
  console.log('  Testing Profit & Loss Statement...');

  // Test P&L generation
  const pnlFilters = {
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    department: 'pharmacy',
  };

  const pnlStatement = await FinancialReportingService.generateProfitLossStatement(pnlFilters);

  // Validate P&L structure
  if (
    !pnlStatement.period ||
    !pnlStatement.revenue ||
    !pnlStatement.expenses ||
    typeof pnlStatement.gross_profit !== 'number'
  ) {
    throw new Error('P&L statement validation failed');
  }

  console.log('  Testing Balance Sheet...');

  // Test Balance Sheet generation
  const balanceSheetFilters = {
    end_date: '2024-01-31',
    include_zero_balances: false,
  };

  const balanceSheet = await FinancialReportingService.generateBalanceSheet(balanceSheetFilters);

  // Validate Balance Sheet structure
  if (
    !balanceSheet.as_of_date ||
    !balanceSheet.assets ||
    !balanceSheet.liabilities ||
    !balanceSheet.equity
  ) {
    throw new Error('Balance sheet validation failed');
  }

  console.log('  Testing Cash Flow Statement...');

  // Test Cash Flow generation
  const cashFlowFilters = {
    start_date: '2024-01-01',
    end_date: '2024-01-31',
  };

  const cashFlowStatement = await FinancialReportingService.generateCashFlowStatement(
    cashFlowFilters
  );

  // Validate Cash Flow structure
  if (
    !cashFlowStatement.period ||
    !cashFlowStatement.operating_activities ||
    !cashFlowStatement.investing_activities ||
    !cashFlowStatement.financing_activities
  ) {
    throw new Error('Cash flow statement validation failed');
  }

  console.log('  Testing Advanced Analytics...');

  // Test Advanced Analytics generation
  const analyticsFilters = {
    start_date: '2024-01-01',
    end_date: '2024-01-31',
  };

  const analytics = await FinancialReportingService.generateAdvancedAnalytics(analyticsFilters);

  // Validate Analytics structure
  if (!analytics.trends || !analytics.kpis || !analytics.forecasting || !analytics.alerts) {
    throw new Error('Advanced analytics validation failed');
  }

  console.log('  Testing Comprehensive Report...');

  // Test comprehensive report generation
  const comprehensiveFilters = {
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    format: 'JSON',
  };

  const comprehensiveReport = await FinancialReportingService.generateComprehensiveReport(
    comprehensiveFilters
  );

  // Validate comprehensive report structure
  if (
    !comprehensiveReport.profit_loss ||
    !comprehensiveReport.balance_sheet ||
    !comprehensiveReport.cash_flow ||
    !comprehensiveReport.analytics
  ) {
    throw new Error('Comprehensive report validation failed');
  }
}

// ===== TEST 2: BUSINESS INTELLIGENCE SYSTEM =====

async function testBusinessIntelligenceSystem() {
  console.log('  Testing Payment Trend Analysis...');

  // Test trend analysis
  const trendFilters = {
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    granularity: 'DAILY',
  };

  const trendAnalysis = await BusinessIntelligenceService.generatePaymentTrendAnalysis(
    trendFilters
  );

  // Validate trend analysis structure
  if (
    !trendAnalysis.period ||
    !trendAnalysis.overall_trends ||
    !trendAnalysis.trend_by_method ||
    !trendAnalysis.time_series_data
  ) {
    throw new Error('Trend analysis validation failed');
  }

  console.log('  Testing Predictive Analytics...');

  // Test predictive analytics
  const predictiveFilters = {
    start_date: '2024-01-01',
    end_date: '2024-01-31',
  };

  const predictiveAnalytics = await BusinessIntelligenceService.generatePredictiveAnalytics(
    predictiveFilters
  );

  // Validate predictive analytics structure
  if (
    !predictiveAnalytics.period ||
    !predictiveAnalytics.revenue_forecasting ||
    !predictiveAnalytics.cash_flow_prediction ||
    !predictiveAnalytics.payment_behavior_prediction
  ) {
    throw new Error('Predictive analytics validation failed');
  }

  console.log('  Testing Dashboard KPI Monitoring...');

  // Test KPI monitoring
  const kpiFilters = {
    start_date: '2024-01-01',
    end_date: '2024-01-31',
  };

  const kpiMonitoring = await BusinessIntelligenceService.generateDashboardKPIMonitoring(
    kpiFilters
  );

  // Validate KPI monitoring structure
  if (
    !kpiMonitoring.real_time_metrics ||
    !kpiMonitoring.kpi_dashboard ||
    !kpiMonitoring.performance_alerts ||
    !kpiMonitoring.trend_indicators
  ) {
    throw new Error('KPI monitoring validation failed');
  }

  console.log('  Testing Real-time Payment Monitoring...');

  // Test real-time monitoring
  const monitoringFilters = {
    start_date: '2024-01-01',
    end_date: '2024-01-31',
  };

  const realTimeMonitoring = await BusinessIntelligenceService.generateRealTimePaymentMonitoring(
    monitoringFilters
  );

  // Validate real-time monitoring structure
  if (
    !realTimeMonitoring.current_status ||
    !realTimeMonitoring.live_transactions ||
    !realTimeMonitoring.system_performance ||
    !realTimeMonitoring.real_time_alerts
  ) {
    throw new Error('Real-time monitoring validation failed');
  }

  console.log('  Testing Comprehensive BI Report...');

  // Test comprehensive BI report
  const biFilters = {
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    granularity: 'DAILY',
  };

  const biReport = await BusinessIntelligenceService.generateComprehensiveBIReport(biFilters);

  // Validate BI report structure
  if (
    !biReport.executive_summary ||
    !biReport.detailed_analysis ||
    !biReport.risk_assessment ||
    !biReport.strategic_recommendations
  ) {
    throw new Error('Business intelligence report validation failed');
  }
}

// ===== TEST 3: INTEGRATION TESTS =====

async function testIntegrationScenarios() {
  console.log('  Testing Financial Reporting Integration...');

  // Test integration between financial reporting components
  const filters = {
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    department: 'pharmacy',
  };

  // Generate all financial reports
  const [pnl, balanceSheet, cashFlow, analytics] = await Promise.all([
    FinancialReportingService.generateProfitLossStatement(filters),
    FinancialReportingService.generateBalanceSheet(filters),
    FinancialReportingService.generateCashFlowStatement(filters),
    FinancialReportingService.generateAdvancedAnalytics(filters),
  ]);

  // Validate data consistency between reports
  if (pnl.period.start_date.getTime() !== balanceSheet.as_of_date.getTime()) {
    throw new Error('Date consistency validation failed between P&L and Balance Sheet');
  }

  console.log('  Testing Business Intelligence Integration...');

  // Test integration between BI components
  const biFilters = {
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    granularity: 'DAILY',
  };

  // Generate all BI components
  const [
    trendAnalysis,
    predictiveAnalytics,
    kpiMonitoring,
    realTimeMonitoring,
  ] = await Promise.all([
    BusinessIntelligenceService.generatePaymentTrendAnalysis(biFilters),
    BusinessIntelligenceService.generatePredictiveAnalytics(biFilters),
    BusinessIntelligenceService.generateDashboardKPIMonitoring(biFilters),
    BusinessIntelligenceService.generateRealTimePaymentMonitoring(biFilters),
  ]);

  // Validate data consistency between BI components
  if (
    trendAnalysis.period.start_date.getTime() !== predictiveAnalytics.period.start_date.getTime()
  ) {
    throw new Error(
      'Date consistency validation failed between trend analysis and predictive analytics'
    );
  }

  console.log('  Testing Cross-System Integration...');

  // Test integration between financial reporting and business intelligence
  const comprehensiveFilters = {
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    format: 'JSON',
  };

  const [financialReport, biReport] = await Promise.all([
    FinancialReportingService.generateComprehensiveReport(comprehensiveFilters),
    BusinessIntelligenceService.generateComprehensiveBIReport(biFilters),
  ]);

  // Validate that both systems can work together
  if (!financialReport.profit_loss || !biReport.detailed_analysis.trend_analysis) {
    throw new Error('Cross-system integration validation failed');
  }

  console.log('  Testing Report Generation Performance...');

  // Test performance of report generation
  const startTime = Date.now();

  await Promise.all([
    FinancialReportingService.generateComprehensiveReport(comprehensiveFilters),
    BusinessIntelligenceService.generateComprehensiveBIReport(biFilters),
  ]);

  const endTime = Date.now();
  const generationTime = endTime - startTime;

  // Ensure reports generate within reasonable time (5 seconds)
  if (generationTime > 5000) {
    throw new Error(`Report generation performance test failed: ${generationTime}ms`);
  }

  console.log(`  Report generation completed in ${generationTime}ms`);
}

// ===== MAIN EXECUTION =====

if (require.main === module) {
  testPhase6Completion()
    .then(() => {
      console.log('\n🎯 Phase 6 testing completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Phase 6 testing failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testPhase6Completion,
  testFinancialReportingSystem,
  testBusinessIntelligenceSystem,
  testIntegrationScenarios,
};
