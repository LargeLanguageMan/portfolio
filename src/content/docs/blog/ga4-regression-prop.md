---
title: "Creating Custom Conversion Prediction Models with GA4"
description: "Build a custom propensity model using GA4 data and BigQuery ML to predict conversions for any key event in your analytics setup."
date: 2024-01-27
authors:
  - wes
---

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
WHERE
    _TABLE_SUFFIX BETWEEN 'DATE-START'
    AND 'DATE-END'
GROUP BY
  user_pseudo_id
```

This query creates a binary flag for each user, marking whether they've completed the conversion event (1) or not (0).

### 2. Create Demographics Table

```sql
WITH first_values AS (
  SELECT
    user_pseudo_id,
    geo.city as city,
    device.operating_system as operating_system,
    device.browser as browser,
    ROW_NUMBER() OVER (PARTITION BY user_pseudo_id ORDER BY event_timestamp DESC) AS row_num
  FROM `your-project.analytics_XXXXX.events_*`
  WHERE event_name = "user_engagement"
    AND _TABLE_SUFFIX BETWEEN 'DATE-START'
    AND 'DATE-END'
)
SELECT * EXCEPT (row_num)
FROM first_values
WHERE row_num = 1
```

### 3. Create Behavioral Features Table

```sql
SELECT
  user_pseudo_id,
  SUM(IF(event_name = 'event_type_1', 1, 0)) AS cnt_event_1,
  SUM(IF(event_name = 'event_type_2', 1, 0)) AS cnt_event_2,
  SUM(IF(event_name = 'event_type_3', 1, 0)) AS cnt_event_3
FROM
  `your-project.analytics_XXXXX.events_*`
WHERE
    _TABLE_SUFFIX BETWEEN 'DATE-START'
    AND 'DATE-END'
GROUP BY
  user_pseudo_id
```

### 4. Combine Tables into Training View

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
  demographics dem ON c.user_pseudo_id = dem.user_pseudo_id
LEFT OUTER JOIN
  behavioral beh ON c.user_pseudo_id = beh.user_pseudo_id
WHERE
  row_num = 1
)
```

### 5. Train the Model

Logistic regression is well-suited for propensity modeling — it provides interpretable results, handles numerical and categorical variables, outputs probabilities between 0 and 1, and is less prone to overfitting than more complex models.

```sql
CREATE OR REPLACE MODEL `your-project.your_dataset.propensity_model`
OPTIONS(
  MODEL_TYPE='LOGISTIC_REG',
  INPUT_LABEL_COLS=['conversion_flag'],
  L1_REG=0.01,
  L2_REG=0.01,
  MAX_ITERATIONS=50,
  LEARN_RATE=0.1
) AS
SELECT
  *
FROM
  `your-project.your_dataset.training_view`
```

### 6. Evaluate Model Performance

```sql
SELECT
  *
FROM
  ML.EVALUATE(MODEL `your-project.your_dataset.propensity_model`)
```

Key metrics to understand:

- **Accuracy** — proportion of correct predictions (0–1, higher is better)
- **Precision** — of users predicted to convert, how many actually did
- **ROC AUC** — 0.7–0.8 is acceptable, 0.8–0.9 is excellent, >0.9 is outstanding
- **Log Loss** — <0.1 is excellent, 0.1–0.3 is good, >0.3 needs improvement

### 7. Generate Predictions

```sql
SELECT
  user_pseudo_id,
  conversion_flag,
  predicted_conversion_flag,
  predicted_conversion_flag_probs[OFFSET(0)].prob as conversion_probability
FROM
  ML.PREDICT(MODEL `your-project.your_dataset.propensity_model`,
    (SELECT * FROM `your-project.your_dataset.training_view`))
```

## Important Considerations

- **Date Ranges**: Use `_TABLE_SUFFIX BETWEEN 'YYYYMMDD' AND 'YYYYMMDD'` for appropriate time periods
- **Event Selection**: Customise behavioral features based on your specific business events
- **Data Quality**: Ensure GA4 is tracking all relevant events consistently
- **Testing**: Split data into training and testing sets for robust evaluation

## Next Steps

Once your model is deployed, you can:

1. Set up regular model retraining to maintain accuracy
2. Create segments based on propensity scores
3. Export high-propensity audiences to GA4 via Data Import
4. Export predictions to your marketing platforms
5. Monitor model performance over time
