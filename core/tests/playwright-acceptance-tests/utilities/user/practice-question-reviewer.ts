// Copyright 2026 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Practice Question Reviewer utility file.
 */

import {Page} from '@playwright/test';
import {Contributor} from './contributor';
import {INTERACTION_TYPES} from './exploration-editor';

const opportunityButtonSelector = '.e2e-test-opportunity-list-item-button';

const reviewButtonPrefix = 'e2e-test-question-suggestion-review';
const reviewModalHeaderSelector =
  '.e2e-test-question-suggestion-review-modal-header';

// Question Suggestion Editor Modal Selectors.
const questionSuggestionEditorModalSelector =
  '.e2e-test-question-suggestion-editor-modal';
const editQuestionPencilIconSelector =
  'button.e2e-test-edit-content-pencil-button';
const saveQuestionButtonSelector = '.e2e-test-save-question-button';
const editButtonSelector = `.${reviewButtonPrefix}-edit-button`;
const stateContentInputField = 'div.e2e-test-rte';
const saveContentButton = 'button.e2e-test-save-state-content';

export class PracticeQuestionReviewer extends Contributor {
  /**
   * Checks that the question in the review modal is the same as the one passed in.
   * @param question The question to check.
   */
  async expectQuestionInReviewModalToBe(question: string): Promise<void> {
    const rteDisplaySelector = '.e2e-test-rte-display';
    await this.expectTextContentToBe(rteDisplaySelector, question);
  }

  /**
   * Checks if the question review modal is present.
   * @param visible Whether the modal should be visible.
   */
  async expectQuestionReviewModalToBePresent(
    visible: boolean = true
  ): Promise<void> {
    await this.expectElementToBeVisible(reviewModalHeaderSelector, visible);
  }

  /**
   * Edits the question in the question editor modal.
   * @param {string} question - The question to edit.
   */
  async editQuestionInQuestionEditorModal(question: string): Promise<void> {
    await this.clickOnElementWithSelector(editQuestionPencilIconSelector);

    await this.expectElementToBeVisible(questionSuggestionEditorModalSelector);

    await this.clearAllTextFrom(stateContentInputField);
    await this.typeInInputField(stateContentInputField, `${question}`);
    await this.clickOnElementWithSelector(saveContentButton);
    await this.expectElementToBeVisible(stateContentInputField, false);
  }

  /**
   * Edits the question in the review.
   * @param {string} question - The question to edit.
   */
  async editQuestionInReview(question: string): Promise<void> {
    // Click on edit button.
    await this.clickOnElementWithSelector(editButtonSelector);

    await this.expectElementToBeVisible(questionSuggestionEditorModalSelector);

    // Update the question.
    await this.editQuestionInQuestionEditorModal(question);

    // Save the question.
    await this.clickOnElementWithSelector(saveQuestionButtonSelector);
    await this.expectToastMessage('Updated question.');
    await this.expectElementToBeVisible(saveQuestionButtonSelector, false);
  }

  /**
   * Edits the question interaction in the review.
   */
  async editQuestionInteractionInReview(): Promise<void> {
    // Click on edit button.
    await this.expectElementToBeVisible(editButtonSelector);
    await this.clickOnElementWithSelector(editButtonSelector);

    await this.removeInteraction();

    await this.addInteraction(INTERACTION_TYPES.NUMERIC_INPUT);

    // Add responses to the number input interaction.
    await this.addResponsesToTheInteraction(
      INTERACTION_TYPES.NUMBER_INPUT,
      '100',
      'Perfect!',
      undefined,
      true
    );

    // Add hint.
    await this.addHintToState('Test Hint');

    // Add a solution to the state.
    await this.addSolutionToState(
      '100',
      'As said in the question itself.',
      true
    );

    // Save the question.
    await this.clickOnElementWithSelector(saveQuestionButtonSelector);
    await this.expectToastMessage('Updated question.');
    await this.expectElementToBeVisible(saveQuestionButtonSelector, false);
  }

  /**
   * Starts a question review.
   * @param question - The question to review.
   * @param skill - The skill the question belongs to.
   */
  async startQuestionReview(question: string, skill: string): Promise<void> {
    const questionElement = await this.expectOpportunityToBePresent(
      question,
      skill
    );

    if (!questionElement) {
      throw new Error(`Opportunity item for question ${question} not found.`);
    }

    if (this.isViewportAtMobileWidth()) {
      await this.clickOnElement(questionElement);
    } else {
      const reviewButton = await questionElement.waitForSelector(
        opportunityButtonSelector
      );
      if (!reviewButton) {
        throw new Error('Review button not found.');
      }

      await this.clickOnElement(reviewButton);
    }
    await this.expectModalTitleToBe(skill);
  }

  /**
   * Submits a question review.
   * @param reviewType - The type of review to submit.
   * @param reviewMessage - The message to submit.
   */
  async submitReview(
    reviewType: 'accept' | 'reject',
    reviewMessage?: string
  ): Promise<void> {
    const buttonSelector = `.${reviewButtonPrefix}-${reviewType}-button`;
    await this.expectElementToBeVisible(buttonSelector);

    if (reviewMessage) {
      await this.fillReviewComment(reviewMessage);
    }

    await this.clickOnElementWithSelector(buttonSelector);
    await this.expectToastMessage('Submitted suggestion review.');
  }
}

export const PracticeQuestionReviewerFactory = (
  page: Page
): PracticeQuestionReviewer => {
  return new PracticeQuestionReviewer(page);
};
