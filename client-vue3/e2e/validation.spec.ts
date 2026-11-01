import { expect, test } from '@playwright/test';
import { expectNoSeriousA11yIssues } from './helpers';

const fields = ['Name', 'Notes', 'Consent', 'Sex', 'Drug', 'Sample date', 'Attachment'];

test('every control blocks submit until valid and ties errors to the field', async ({ page }) => {
  await page.goto('/kit-harness.html?view=validation');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('This field is required')).toHaveCount(fields.length - 1);
  await expect(page.getByText('Must be accepted')).toBeVisible();
  await expect(page.getByTestId('submitted')).toHaveText('0');
  await expect(page.getByLabel('Name')).toHaveAccessibleDescription('This field is required');
  await expect(page.getByRole('combobox', { name: 'Drug' })).toHaveAccessibleDescription(
    'This field is required'
  );
  await expect(page.getByRole('checkbox', { name: 'Consent' })).toHaveAccessibleDescription(
    'Must be accepted'
  );
  await expectNoSeriousA11yIssues(page, 'validation-errors');

  await page.getByLabel('Name').fill('Ada');
  await page.getByLabel('Notes').fill('Stable');
  await page.getByRole('checkbox', { name: 'Consent' }).click();
  await page.getByRole('radio', { name: 'Female' }).click();
  await page.getByRole('combobox', { name: 'Drug' }).click();
  await page.getByRole('option', { name: 'Metformin 500mg' }).click();
  await page.getByRole('spinbutton', { name: /day/i }).focus();
  await page.keyboard.type('15062026');
  await page
    .getByLabel('Attachment')
    .setInputFiles({ name: 'a.pdf', mimeType: 'application/pdf', buffer: Buffer.from('x') });
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByTestId('submitted')).toHaveText('1');
  await expect(page.getByText('This field is required')).toHaveCount(0);
});
