ALTER TABLE `Test_Results`
    ADD COLUMN `form_template_id` INT DEFAULT NULL;

CREATE INDEX `idx_test_results_form_template` ON `Test_Results` (`form_template_id`);

ALTER TABLE `Test_Results`
    ADD CONSTRAINT `FK_Test_Results_form_template_id_Lab_Form_Template`
        FOREIGN KEY (`form_template_id`)
            REFERENCES `Lab_Form_Templates` (`id`)
            ON UPDATE CASCADE
            ON DELETE SET NULL;