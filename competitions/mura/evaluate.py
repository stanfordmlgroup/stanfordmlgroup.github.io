#!./venv/bin/python
""" 
MURA Competition evaluation script.
"""
from __future__ import print_function
from __future__ import division

import argparse
import json
import sys

import numpy as np
import pandas as pd

from sklearn.metrics import confusion_matrix


def get_majority(gt_annotations):

    return gt_annotations.mode(axis=1)


def kappa_score(preds1, preds2):
    cnf = confusion_matrix(preds1, preds2)
    row_marg = np.sum(cnf, axis=1)
    col_marg = np.sum(cnf, axis=0)
    marg_mult = col_marg * row_marg
    n = np.sum(row_marg)
    pr_e = np.sum(marg_mult) / n / n
    pr_a = (cnf[0][0] + cnf[1][1]) / n
    kappa = (pr_a - pr_e) / (1 - pr_e)
    
    se_k = (pr_a * (1 - pr_a)) / (n * (1 - pr_e)**2)
    lower = kappa - 1.96*se_k
    upper = kappa + 1.96*se_k
    return kappa, lower, upper


def get_scores_exact(combined, rad):
    maj_preds = combined["Label"].as_matrix()
    rad_preds = combined[rad].as_matrix()
    return kappa_score(maj_preds, rad_preds)


def get_annotations(annotations_path):

    for col_headers in ["Rad1", "Rad2", "Rad3"], ["Label"]:

        try:

            annotations = pd.read_csv(annotations_path,
                                      header=None)

            annotations.columns = ["Study"] + col_headers

            return annotations, col_headers

        except:

            pass

    raise ValueError("Test path cannot be read. Make sure to use test.csv or valid.csv")


def evaluate(annotations_path, predictions_path):

    annotations, col_headers = get_annotations(annotations_path)

    predictions = pd.read_csv(predictions_path,
                              header=None,
                              names=["Study", "Model"])
    predictions["Study"] = predictions["Study"].apply(lambda x: x + "/" if not x.endswith("/") else x)

    gt_annotations = annotations[col_headers]

    if len(col_headers) == 3:

        annotations['Label'] = get_majority(gt_annotations)

    combined = annotations.merge(predictions, on="Study", how="inner")

    assert combined.shape[0] == predictions.shape[0]

    body_parts = ["Elbow", "Finger", "Forearm", "Hand", "Humerus", "Shoulder", "Wrist", "/"]

    results_dict = {}

    for body_part in body_parts:
        row = [body_part]

        combined_of_type = combined[combined["Study"].str.contains(body_part.upper())]
        
        klu = get_scores_exact(combined_of_type, "Model")

        results_dict[body_part + "_Mean"] = klu[0]
        results_dict[body_part + "_Lower"] = klu[1]
        results_dict[body_part + "_Upper"] = klu[2]

    results_dict["Overall_Mean"] = results_dict.pop("/_Mean")
    results_dict["Overall_Lower"] = results_dict.pop("/_Lower")
    results_dict["Overall_Upper"] = results_dict.pop("/_Upper")
    
    return results_dict


def main():
    parser = argparse.ArgumentParser(formatter_class=argparse.RawTextHelpFormatter)
    parser.add_argument('annotations_path',
                        help='path to csv file containing radiologist annotations.')
    parser.add_argument('predictions_path',
                        help='path to csv file containing predictions.')
    args = parser.parse_args()

    scores = evaluate(args.annotations_path, args.predictions_path)

    json.dump(scores, sys.stdout)
    print()

if __name__ == '__main__':
    main()