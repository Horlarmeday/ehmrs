import { classifyPayer } from './payer-classification';

describe('classifyPayer', () => {
  it('returns undefined (cash) when there are no coverage facts', () => {
    expect(classifyPayer(null)).toBeUndefined();
  });

  it('maps a Retainership insurance to a retainership payer keyed by the company hmo id', () => {
    const payer = classifyPayer({ insurance_id: 9, hmo_id: 42, insuranceName: 'Retainership' });
    expect(payer).toEqual({ payer_type: 'retainership', retainership_id: '42' });
  });

  it.each(['NHIS', 'FHSS', 'PHIS'])('maps insurance %s to a scheme_hmo payer', name => {
    const payer = classifyPayer({ insurance_id: 3, hmo_id: 7, insuranceName: name });
    expect(payer).toEqual({ payer_type: 'scheme_hmo', scheme_id: '3', hmo_id: '7' });
  });

  it('carries no retainership_id on a scheme_hmo payer', () => {
    const payer = classifyPayer({ insurance_id: 3, hmo_id: 7, insuranceName: 'NHIS' });
    expect(payer && 'retainership_id' in payer).toBe(false);
  });

  it('carries no scheme_id / hmo_id on a retainership payer', () => {
    const payer = classifyPayer({ insurance_id: 9, hmo_id: 42, insuranceName: 'Retainership' });
    expect(payer && 'scheme_id' in payer).toBe(false);
    expect(payer && 'hmo_id' in payer).toBe(false);
  });
});
