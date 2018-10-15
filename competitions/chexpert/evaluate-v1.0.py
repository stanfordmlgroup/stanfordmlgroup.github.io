#!./venv/bin/python
""" 
CheXpert Competition evaluation script.
"""
import argparse
import sys

import numpy as np
import pandas as pd

from sklearn.metrics import roc_auc_score


def evaluate(annotations_path, predictions_path):

    competition_tasks = ["Atelectasis", "Cardiomegaly", "Consolidation", "Edema", "Pleural Effusion"]
    
    annotations = pd.read_csv(annotations_path)

    predictions = pd.read_csv(predictions_path)
    assert all([task in list(predictions) for task in competition_tasks])

    annotations["Study"] = annotations["Study"].apply(lambda x: x + "/" if not x.endswith("/") else x)
    predictions["Study"] = predictions["Study"].apply(lambda x: x + "/" if not x.endswith("/") else x)

    annotations = annotations.rename(columns={t: t+"_GT" for t in competition_tasks})
    predictions = predictions.rename(columns={t: t+"_P" for t in competition_tasks})

    combined = annotations.merge(predictions, on="Study", how="inner")

    assert combined.shape[0] == predictions.shape[0] == annotations.shape[0], "Paths did not match during evaluation"

    results_dict = {}

    for task in competition_tasks:

        auc = roc_auc_score(annotations[task+"_GT"], predictions[task+"_P"])

        results_dict[task.split()[-1] + "_AUROC"] = auc

    results_dict["Average_AUROC"] = np.mean([results_dict[task.split()[-1]+"_AUROC"] for task in competition_tasks])
    
    return results_dict


def main():
    parser = argparse.ArgumentParser(formatter_class=argparse.RawTextHelpFormatter)
    parser.add_argument('annotations_path',
                        help='path to csv file containing radiologist annotations.')
    parser.add_argument('predictions_path',
                        help='path to csv file containing predictions.')
    args = parser.parse_args()

    scores = evaluate(args.annotations_path, args.predictions_path)

    print(scores)
    sys.stdout.flush()

if __name__ == '__main__':
    main()