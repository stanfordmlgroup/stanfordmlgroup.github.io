#!./venv/bin/python
""" 
CheXpert competition evaluation script.
"""
import argparse
import sys

import numpy as np
import pandas as pd

from sklearn.metrics import roc_auc_score, roc_curve

# Radiologist specificity/sensitivity scores.
RAD_SCORES = {"Atelectasis": [(0.7867435158501441, 0.803921568627451),
                              (0.8242074927953891, 0.7124183006535948),
                              (0.6858789625360231, 0.9215686274509803)],
              "Cardiomegaly": [(0.9541547277936963, 0.4768211920529801),
                               (0.7679083094555874, 0.8543046357615894),
                               (0.8939828080229226, 0.7019867549668874)],
              "Consolidation": [(0.8895966029723992, 0.6551724137931034),
                                (0.910828025477707, 0.4827586206896552),
                                (0.9660297239915074, 0.4482758620689655)],
              "Edema": [(0.9146919431279621, 0.6282051282051282),
                        (0.8127962085308057, 0.7948717948717948),
                        (0.9265402843601895, 0.5769230769230769)],
              "Pleural Effusion": [(0.946969696969697, 0.8173076923076923),
                                   (0.8257575757575758, 0.82692307692307693),
                                   (0.8636363636363636, 0.8942307692307693)]}


def test_curve_above_point(X, Y, x, y):

    i = 0
    curve_x = X[0]
    while curve_x < x:
        i += 1
        curve_x = X[i]

    curve_y = Y[i-1]

    return curve_y >= y


def rads_under_curve(annotations, predictions, rad_spec_sens):

    fpr, tpr, threshold = roc_curve(annotations, predictions)

    num_below_roc = 0
    for (rad_specificity, rad_sensitivity) in rad_spec_sens:

        is_curve_above_point = test_curve_above_point(fpr, tpr,
                                                      1 - rad_specificity,
                                                      rad_sensitivity)

        if is_curve_above_point:
            num_below_roc += 1

    return num_below_roc


def evaluate(annotations_path, predictions_path):

    competition_tasks = RAD_SCORES.keys()
    
    annotations = pd.read_csv(annotations_path)

    predictions = pd.read_csv(predictions_path)
    assert all([task in list(predictions) for task in competition_tasks])

    annotations["Study"] = annotations["Study"].apply(lambda x: x + "/" if not x.endswith("/") else x)
    predictions["Study"] = predictions["Study"].apply(lambda x: x + "/" if not x.endswith("/") else x)

    annotations = annotations.rename(columns={t: t+"_GT"
                                              for t in competition_tasks})
    predictions = predictions.rename(columns={t: t+"_P"
                                              for t in competition_tasks})

    combined = annotations.merge(predictions, on="Study", how="inner")

    assert combined.shape[0] == predictions.shape[0] == annotations.shape[0],\
        "Paths did not match during evaluation"

    results_dict = {}

    for task in competition_tasks:

        task_annotations = combined[task+"_GT"]
        task_predictions = combined[task+"_P"]
        auc = roc_auc_score(task_annotations, task_predictions)
        num_rads_under = rads_under_curve(task_annotations, task_predictions,
                                      RAD_SCORES[task])

        task_name = task.split()[-1]
        results_dict[task_name + "_AUROC"] = auc
        results_dict[task_name + "_NumRadsUnderROC"] = num_rads_under

    results_dict["Average_AUROC"] = np.mean([results_dict[task.split()[-1]+"_AUROC"]
                                             for task in competition_tasks])
    results_dict["Average_NumRadsUnderROC"] = np.mean([results_dict[task.split()[-1]+"_NumRadsUnderROC"]
                                                       for task in competition_tasks])
    
    return results_dict


def main():
    parser = argparse.ArgumentParser(formatter_class=argparse.RawTextHelpFormatter)
    parser.add_argument('annotations_path',
                        help='path to csv with radiologist annotations.')
    parser.add_argument('predictions_path',
                        help='path to csv with predictions.')
    args = parser.parse_args()

    scores = evaluate(args.annotations_path, args.predictions_path)

    print(scores)
    sys.stdout.flush()

if __name__ == '__main__':
    main()
