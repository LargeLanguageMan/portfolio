---
navigation:
title: GA4 Propensity Model
description: Build a Propensity to purchase model using GA4 data
---

# Creating Custom Conversion Prediction Models with GA4

Learn how to develop a tailored propensity model using GA4 data to predict user behavior and conversion likelihood for any key event in your analytics setup.

## Introduction
While GA4's built-in predictive capabilities focus primarily on purchase and churn predictions, many organisations need to forecast different types of conversions. This guide demonstrates how to construct a custom propensity model in BigQuery using your GA4 data, allowing you to predict any conversion event that matters to your business.

## What You'll Need
- GA4 property configured and collecting data
- BigQuery project set up and linked to GA4
- Defined key conversion event(s) in your analytics
- Familiarity with your GA4 event structure

## Step-by-Step Implementation

### 1. Create Label Table
First, we'll identify users who have completed our target conversion action:
```sql
SELECT
  user_pseudo_id,
  MAX(CASE WHEN event_name = 'target_conversion_event' THEN 1 ELSE 0 END) AS conversion_flag
FROM
  `your-project.analytics_XXXXX.events_*`
GROUP BY
  user_pseudo_id
```
This query creates a binary flag for each user, marking whether they've completed the conversion event (1) or not (0).

### 2. Create Demographics Table
Next, we'll gather user demographic information:
```sql
WITH first_values AS (
  SELECT
    user_pseudo_id,
    geo.country as country,
    device.operating_system as operating_system,
    device.language as language,
    ROW_NUMBER() OVER (PARTITION BY user_pseudo_id ORDER BY event_timestamp DESC) AS row_num
  FROM `your-project.analytics_XXXXX.events_*`
  WHERE event_name = "user_engagement"
)
SELECT * EXCEPT (row_num)
FROM first_values
WHERE row_num = 1
```
This query captures the most recent demographic data for each user.

### 3. Create Behavioral Features Table
Now, let's aggregate user interactions:
```sql
SELECT
  user_pseudo_id,
  SUM(IF(event_name = 'event_type_1', 1, 0)) AS cnt_event_1,
  SUM(IF(event_name = 'event_type_2', 1, 0)) AS cnt_event_2,
  SUM(IF(event_name = 'event_type_3', 1, 0)) AS cnt_event_3
FROM
  `your-project.analytics_XXXXX.events_*`
GROUP BY
  user_pseudo_id
```

This query counts different types of interactions for each user.

### 4. Combine Tables into Training View
Create a comprehensive view combining all features:
```sql
CREATE OR REPLACE VIEW `your-project.your_dataset.training_view` AS (
WITH
  conversion_data AS (
    -- Label table query from step 1
  ),
  demographics AS (
    -- Demographics query from step 2
  ),
  behavioral AS (
    -- Behavioral query from step 3
  )
SELECT
  dem.* EXCEPT (row_num),
  IFNULL(beh.cnt_event_1, 0) AS cnt_event_1,
  IFNULL(beh.cnt_event_2, 0) AS cnt_event_2,
  IFNULL(beh.cnt_event_3, 0) AS cnt_event_3,
  c.conversion_flag
FROM
  conversion_data c
LEFT OUTER JOIN
  demographics dem
ON
  c.user_pseudo_id = dem.user_pseudo_id
LEFT OUTER JOIN
  behavioral beh
ON
  c.user_pseudo_id = beh.user_pseudo_id
WHERE
  row_num = 1
)
```
### 5. Train the Model
In this section, we'll use logistic regression, a powerful statistical method for binary classification problems. Logistic regression is particularly well-suited for propensity modeling because:

- It provides interpretable results with clear feature importance
- It handles both numerical and categorical variables effectively
- It outputs probability scores between 0 and 1
- It's computationally efficient for large datasets
- It's less prone to overfitting compared to more complex models

Here's how to create and train the model:

```sql
CREATE OR REPLACE MODEL `your-project.your_dataset.propensity_model`
OPTIONS(
  MODEL_TYPE='LOGISTIC_REG',
  INPUT_LABEL_COLS=['conversion_flag'],
  -- Optionally tune these hyperparameters
  L1_REG=0.01,  -- L1 regularisation strength
  L2_REG=0.01,  -- L2 regularisation strength
  MAX_ITERATIONS=50,  -- Maximum number of training iterations
  LEARN_RATE=0.1  -- Learning rate for model training
) AS
SELECT
  *
FROM
  `your-project.your_dataset.training_view`
```

You can adjust the hyperparameters based on your specific needs:
- Increase `L1_REG` or `L2_REG` to prevent overfitting
- Adjust `MAX_ITERATIONS` for convergence vs. training time
- Modify `LEARN_RATE` to balance training stability and speed

### 6. Evaluate Model Performance
Check the model's performance metrics:
```sql
SELECT
  *
FROM
  ML.EVALUATE(MODEL `your-project.your_dataset.propensity_model`)
```

Understanding the evaluation metrics:

- **Accuracy**: The proportion of correct predictions (both true positives and true negatives) out of all predictions. Ranges from 0 to 1, where 1 is perfect accuracy.
  - Example: Accuracy of 0.85 means 85% of all predictions were correct

- **Precision**: The proportion of true positive predictions out of all positive predictions. Shows how many users predicted to convert actually did convert.
  - Example: Precision of 0.70 means 70% of users predicted to convert actually converted

- **ROC AUC** (Receiver Operating Characteristic Area Under Curve): Measures the model's ability to distinguish between classes across all possible classification thresholds. Ranges from 0 to 1.
  - 0.5 indicates random predictions
  - 0.7-0.8 is acceptable
  - 0.8-0.9 is excellent
  - >0.9 is outstanding

- **Log Loss**: Measures the uncertainty of predictions by penalising confident incorrect predictions more heavily than less confident ones. Lower values are better.
  - <0.1: Excellent
  - 0.1-0.3: Good
  - >0.3: Needs improvement

### 7. Generate Predictions
Get predictions for your users:
```sql
SELECT
  user_pseudo_id,
  conversion_flag,
  predicted_conversion_flag,
  predicted_conversion_flag_probs[OFFSET(0)].prob as conversion_probability
FROM
  ML.PREDICT(MODEL `your-project.your_dataset.propensity_model`,
    (SELECT * FROM `your-project.your_dataset.training_view`)) #this can also any other dataset, so if you are using it for predicting for fresher batch of data
```
## Important Considerations

- Date Ranges: Adjust your queries using _TABLE_SUFFIX BETWEEN 'YYYYMMDD' AND 'YYYYMMDD' to analyse appropriate time periods
- Event Selection: Customise the behavioral features based on your specific business events and goals
- Data Quality: Ensure your GA4 implementation is tracking all relevant events consistently
- Model Tuning: Consider experimenting with different model parameters and feature engineering approaches
- Testing: Split your data into training and testing sets for more robust model evaluation

## Next Steps

Once your model is deployed, you can:
1. Set up regular model retraining to maintain accuracy
2. Create segments based on propensity scores
3. Export high-propensity audiences to GA4 using data import:
   - Export user pseudo IDs with high propensity scores to a CSV file
   - Use GA4's Data Import feature to create custom audiences
   - Configure audience membership duration based on your needs
   - Use these audiences for targeted marketing campaigns
4. Export predictions to your marketing platforms
5. Monitor model performance over time
6. Use insights to optimise your conversion funnel

This approach allows you to create custom prediction models for any conversion event in your GA4 setup, providing valuable insights for your marketing and business strategies.







