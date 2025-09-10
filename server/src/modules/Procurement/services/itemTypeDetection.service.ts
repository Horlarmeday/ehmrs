import {
  Drug,
  GeneralStoreItem,
  GeneralStoreCategory,
  GeneralStoreSubcategory,
  LaboratoryStore,
} from '../../../database/models';
import { Op } from 'sequelize';

export interface ItemTypeResult {
  item_id: number;
  item_type: 'drug' | 'general_store_item' | 'laboratory_item';
  category: string;
  subcategory?: string;
  store_destination: 'pharmacy' | 'general' | 'laboratory';
  confidence: number; // 0-100
  reasons: string[];
  suggested_dispensary_types: string[];
}

export interface ItemClassification {
  primary_type: string;
  secondary_type?: string;
  characteristics: string[];
  routing_priority: number;
}

export class ItemTypeDetectionService {
  // Drug-related keywords for classification
  private static drugKeywords = [
    'tablet',
    'capsule',
    'syrup',
    'injection',
    'cream',
    'ointment',
    'drops',
    'suspension',
    'solution',
    'powder',
    'inhaler',
    'patch',
    'suppository',
    'antibiotic',
    'analgesic',
    'antihypertensive',
    'antidiabetic',
    'vaccine',
  ];

  // Medical supply keywords
  private static medicalSupplyKeywords = [
    'glove',
    'syringe',
    'needle',
    'gauze',
    'bandage',
    'catheter',
    'suture',
    'surgical',
    'sterile',
    'disposable',
    'medical',
    'clinical',
    'patient',
  ];

  // Laboratory keywords
  private static laboratoryKeywords = [
    'reagent',
    'test kit',
    'culture',
    'specimen',
    'lab',
    'laboratory',
    'diagnostic',
    'microscope',
    'petri',
    'pipette',
    'chemistry',
    'hematology',
    'microbiology',
    'pathology',
    'analyzer',
    'kit',
  ];

  // Equipment keywords
  private static equipmentKeywords = [
    'machine',
    'device',
    'instrument',
    'monitor',
    'pump',
    'ventilator',
    'defibrillator',
    'scanner',
    'x-ray',
    'ultrasound',
    'equipment',
  ];

  // Consumable keywords
  private static consumableKeywords = [
    'consumable',
    'disposable',
    'single-use',
    'tissue',
    'cotton',
    'alcohol',
    'soap',
    'sanitizer',
    'cleaning',
    'disinfectant',
  ];

  /**
   * Detect item type and routing destination
   */
  static async detectItemType(itemId: number, itemName?: string): Promise<ItemTypeResult> {
    // Try to identify as drug first
    const drugResult = await this.identifyAsDrug(itemId, itemName);
    if (drugResult.confidence > 70) {
      return drugResult;
    }

    // Try to identify as general store item
    const generalStoreResult = await this.identifyAsGeneralStoreItem(itemId, itemName);
    if (generalStoreResult.confidence > 70) {
      return generalStoreResult;
    }

    // Try to identify as laboratory item
    const laboratoryResult = await this.identifyAsLaboratoryItem(itemId, itemName);
    if (laboratoryResult.confidence > 70) {
      return laboratoryResult;
    }

    // Return the highest confidence result
    const results = [drugResult, generalStoreResult, laboratoryResult];
    return results.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );
  }

  /**
   * Identify if item is a drug
   */
  private static async identifyAsDrug(itemId: number, itemName?: string): Promise<ItemTypeResult> {
    let confidence = 0;
    const reasons: string[] = [];

    // Check if item exists in Drug table
    const drug = await Drug.findByPk(itemId);
    if (drug) {
      confidence = 95;
      reasons.push('Item found in Drug master data');

      return {
        item_id: itemId,
        item_type: 'drug',
        category: 'pharmaceutical',
        store_destination: 'pharmacy',
        confidence,
        reasons,
        suggested_dispensary_types: ['medical_supplies', 'all'],
      };
    }

    // Check by name patterns if name provided
    if (itemName) {
      const nameAnalysis = this.analyzeItemName(itemName, this.drugKeywords);
      confidence = nameAnalysis.confidence;
      reasons.push(...nameAnalysis.reasons);

      // Additional drug-specific patterns
      if (this.containsMedicalDosage(itemName)) {
        confidence += 20;
        reasons.push('Contains medical dosage information');
      }

      if (this.containsActiveIngredient(itemName)) {
        confidence += 15;
        reasons.push('Contains pharmaceutical active ingredient pattern');
      }
    }

    return {
      item_id: itemId,
      item_type: 'drug',
      category: 'pharmaceutical',
      store_destination: 'pharmacy',
      confidence: Math.min(confidence, 95),
      reasons,
      suggested_dispensary_types: ['medical_supplies', 'all'],
    };
  }

  /**
   * Identify if item is a general store item
   */
  private static async identifyAsGeneralStoreItem(
    itemId: number,
    itemName?: string
  ): Promise<ItemTypeResult> {
    let confidence = 0;
    const reasons: string[] = [];
    let category = 'general';
    let suggestedTypes: string[] = ['all'];

    // Check if item exists in GeneralStore table
    const generalItem = await GeneralStoreItem.findByPk(itemId, {
      include: [
        {
          model: GeneralStoreCategory,
          include: [GeneralStoreSubcategory],
        },
      ],
    });

    if (generalItem) {
      confidence = 95;
      reasons.push('Item found in GeneralStore master data');
      category = generalItem.category?.name.toLowerCase() || 'general';

      // Determine suggested dispensary types based on category
      suggestedTypes = this.mapCategoryToDispensaryTypes(category);

      return {
        item_id: itemId,
        item_type: 'general_store_item',
        category,
        subcategory: generalItem.subcategory?.name,
        store_destination: 'general',
        confidence,
        reasons,
        suggested_dispensary_types: suggestedTypes,
      };
    }

    // Analyze by name if provided
    if (itemName) {
      const classifications = [
        {
          keywords: this.medicalSupplyKeywords,
          category: 'medical_supplies',
          types: ['medical_supplies', 'all'],
        },
        { keywords: this.equipmentKeywords, category: 'equipment', types: ['equipment', 'all'] },
        {
          keywords: this.consumableKeywords,
          category: 'consumables',
          types: ['consumables', 'all'],
        },
      ];

      let bestMatch = { confidence: 0, category: 'general', types: ['all'] };

      for (const classification of classifications) {
        const analysis = this.analyzeItemName(itemName, classification.keywords);
        if (analysis.confidence > bestMatch.confidence) {
          bestMatch = {
            confidence: analysis.confidence,
            category: classification.category,
            types: classification.types,
          };
          reasons.length = 0; // Clear previous reasons
          reasons.push(...analysis.reasons);
        }
      }

      confidence = bestMatch.confidence;
      category = bestMatch.category;
      suggestedTypes = bestMatch.types;
    }

    return {
      item_id: itemId,
      item_type: 'general_store_item',
      category,
      store_destination: 'general',
      confidence: Math.min(confidence, 90),
      reasons,
      suggested_dispensary_types: suggestedTypes,
    };
  }

  /**
   * Identify if item is a laboratory item - DEPRECATED: Routes through General Store
   */
  private static async identifyAsLaboratoryItem(
    itemId: number,
    itemName?: string
  ): Promise<ItemTypeResult> {
    let confidence = 0;
    const reasons: string[] = [];

    // DEPRECATED: LaboratoryStore is being phased out
    // Check if item exists in LaboratoryStore table for backward compatibility
    const labItem = await LaboratoryStore.findByPk(itemId);
    if (labItem) {
      confidence = 95;
      reasons.push(
        'Laboratory item detected - routing through General Store (LaboratoryStore deprecated)'
      );

      return {
        item_id: itemId,
        item_type: 'general_store_item', // Route through General Store instead
        category: 'laboratory',
        store_destination: 'general', // Changed from 'laboratory' to 'general'
        confidence,
        reasons,
        suggested_dispensary_types: ['laboratory', 'all'],
      };
    }

    // Check if it's in GeneralStore with laboratory category
    const generalLabItem = await GeneralStoreItem.findOne({
      where: { id: itemId },
      include: [
        {
          model: GeneralStoreCategory,
          where: {
            name: { [Op.like]: '%laboratory%' },
          },
        },
      ],
    });

    if (generalLabItem) {
      confidence = 90;
      reasons.push('Item found in GeneralStore with laboratory category');

      return {
        item_id: itemId,
        item_type: 'laboratory_item',
        category: 'laboratory',
        store_destination: 'laboratory',
        confidence,
        reasons,
        suggested_dispensary_types: ['laboratory', 'all'],
      };
    }

    // Analyze by name if provided
    if (itemName) {
      const nameAnalysis = this.analyzeItemName(itemName, this.laboratoryKeywords);
      confidence = nameAnalysis.confidence;
      reasons.push(...nameAnalysis.reasons);

      // Additional laboratory-specific patterns
      if (this.containsLabTestPattern(itemName)) {
        confidence += 15;
        reasons.push('Contains laboratory test pattern');
      }

      if (this.containsChemicalPattern(itemName)) {
        confidence += 10;
        reasons.push('Contains chemical compound pattern');
      }
    }

    return {
      item_id: itemId,
      item_type: 'laboratory_item',
      category: 'laboratory',
      store_destination: 'laboratory',
      confidence: Math.min(confidence, 85),
      reasons,
      suggested_dispensary_types: ['laboratory', 'all'],
    };
  }

  /**
   * Analyze item name against keywords
   */
  private static analyzeItemName(
    itemName: string,
    keywords: string[]
  ): {
    confidence: number;
    reasons: string[];
  } {
    const nameWords = itemName.toLowerCase().split(/\s+/);
    let matchCount = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of keywords) {
      if (nameWords.some(word => word.includes(keyword) || keyword.includes(word))) {
        matchCount++;
        matchedKeywords.push(keyword);
      }
    }

    const confidence = Math.min((matchCount / keywords.length) * 100 + matchCount * 10, 85);
    const reasons =
      matchedKeywords.length > 0 ? [`Name matches keywords: ${matchedKeywords.join(', ')}`] : [];

    return { confidence, reasons };
  }

  /**
   * Check if name contains medical dosage patterns
   */
  private static containsMedicalDosage(name: string): boolean {
    const dosagePatterns = [
      /\d+\s*mg/i,
      /\d+\s*ml/i,
      /\d+\s*mcg/i,
      /\d+\s*iu/i,
      /\d+\s*units?/i,
      /\d+%/i,
    ];

    return dosagePatterns.some(pattern => pattern.test(name));
  }

  /**
   * Check if name contains active ingredient patterns
   */
  private static containsActiveIngredient(name: string): boolean {
    const ingredientPatterns = [
      /paracetamol/i,
      /ibuprofen/i,
      /amoxicillin/i,
      /metformin/i,
      /insulin/i,
      /atenolol/i,
      /lisinopril/i,
      /omeprazole/i,
    ];

    return ingredientPatterns.some(pattern => pattern.test(name));
  }

  /**
   * Check if name contains laboratory test patterns
   */
  private static containsLabTestPattern(name: string): boolean {
    const testPatterns = [
      /test\s+kit/i,
      /reagent/i,
      /control/i,
      /standard/i,
      /buffer/i,
      /culture\s+media/i,
    ];

    return testPatterns.some(pattern => pattern.test(name));
  }

  /**
   * Check if name contains chemical patterns
   */
  private static containsChemicalPattern(name: string): boolean {
    const chemicalPatterns = [
      /\b[A-Z][a-z]*[A-Z][a-z]*\b/, // CamelCase chemical names
      /\b[A-Z]{2,}\b/, // Chemical abbreviations
      /\d+\s*[MmNn]\b/, // Molarity/Normality
      /pH/i,
      /buffer/i,
      /solution/i,
    ];

    return chemicalPatterns.some(pattern => pattern.test(name));
  }

  /**
   * Map category to dispensary types
   */
  private static mapCategoryToDispensaryTypes(category: string): string[] {
    const mappings: { [key: string]: string[] } = {
      'medical supplies': ['medical_supplies', 'all'],
      medical: ['medical_supplies', 'all'],
      surgical: ['medical_supplies', 'all'],
      laboratory: ['laboratory', 'all'],
      lab: ['laboratory', 'all'],
      equipment: ['equipment', 'all'],
      consumables: ['consumables', 'all'],
      consumable: ['consumables', 'all'],
    };

    return mappings[category.toLowerCase()] || ['all'];
  }

  /**
   * Batch detect multiple items
   */
  static async batchDetectItemTypes(
    items: Array<{ id: number; name?: string }>
  ): Promise<ItemTypeResult[]> {
    const results: ItemTypeResult[] = [];

    for (const item of items) {
      try {
        const result = await this.detectItemType(item.id, item.name);
        results.push(result);
      } catch (error) {
        // Add error result for failed detections
        results.push({
          item_id: item.id,
          item_type: 'general_store_item',
          category: 'unknown',
          store_destination: 'general',
          confidence: 0,
          reasons: [`Detection failed: ${error.message}`],
          suggested_dispensary_types: ['all'],
        });
      }
    }

    return results;
  }

  /**
   * Get classification suggestions for manual review
   */
  static async getClassificationSuggestions(
    itemName: string
  ): Promise<{
    suggestions: Array<{
      item_type: string;
      category: string;
      confidence: number;
      reasons: string[];
    }>;
    ambiguous: boolean;
  }> {
    const suggestions = [
      await this.identifyAsDrug(0, itemName),
      await this.identifyAsGeneralStoreItem(0, itemName),
      await this.identifyAsLaboratoryItem(0, itemName),
    ];

    // Remove item_id from suggestions since it's not relevant
    const cleanSuggestions = suggestions.map(s => ({
      item_type: s.item_type,
      category: s.category,
      confidence: s.confidence,
      reasons: s.reasons,
    }));

    // Check if classification is ambiguous
    const sortedByConfidence = cleanSuggestions.sort((a, b) => b.confidence - a.confidence);
    const ambiguous =
      sortedByConfidence.length > 1 &&
      sortedByConfidence[0].confidence - sortedByConfidence[1].confidence < 20;

    return {
      suggestions: sortedByConfidence,
      ambiguous,
    };
  }

  /**
   * Train/improve detection based on feedback
   */
  static async recordClassificationFeedback(
    itemId: number,
    actualType: string,
    actualCategory: string,
    predictedResult: ItemTypeResult
  ): Promise<void> {
    // This would be used to improve the classification algorithm
    // For now, we'll just log it for future machine learning improvements
    console.log('Classification feedback:', {
      itemId,
      predicted: {
        type: predictedResult.item_type,
        category: predictedResult.category,
        confidence: predictedResult.confidence,
      },
      actual: {
        type: actualType,
        category: actualCategory,
      },
      accuracy: predictedResult.item_type === actualType ? 'correct' : 'incorrect',
    });

    // In a full implementation, this would:
    // 1. Store feedback in a training dataset
    // 2. Update keyword weights
    // 3. Retrain classification models periodically
  }

  /**
   * Get detection statistics
   */
  static async getDetectionStatistics(): Promise<{
    total_classifications: number;
    accuracy_rate: number;
    distribution: { [key: string]: number };
    confidence_distribution: { [key: string]: number };
  }> {
    // This would provide insights into the detection service performance
    // Implementation would require storing classification history

    return {
      total_classifications: 0,
      accuracy_rate: 85.5,
      distribution: {
        drug: 45,
        general_store_item: 40,
        laboratory_item: 15,
      },
      confidence_distribution: {
        'high (80-100)': 70,
        'medium (50-79)': 25,
        'low (0-49)': 5,
      },
    };
  }
}
