#!./venv/bin/python
""" 
MRNet Competition evaluation script.
"""
import argparse
import sys
import json

import numpy as np

from sklearn.metrics import roc_auc_score

def evaluate(annotations_path, predictions_path):

    competition_tasks = ['Abnormal', 'ACL', 'Meniscus']
    
    annotations = np.genfromtxt(annotations_path, delimiter=',')
    predictions = np.genfromtxt(predictions_path, delimiter=',')

    assert annotations.shape[0] == predictions.shape[0], 'Paths did not match during evaluation'

    results_dict = {}

    for task in competition_tasks:

        auc = roc_auc_score(annotations[:,competition_tasks.index(task)], predictions[:,competition_tasks.index(task)])

        results_dict[task+'_AUROC'] = auc

    results_dict['Average_AUROC'] = np.mean([results_dict[task+'_AUROC'] for task in competition_tasks])
    
    return results_dict


def main():
    parser = argparse.ArgumentParser(formatter_class=argparse.RawTextHelpFormatter)
    parser.add_argument('annotations_path',
                        help='path to csv file containing radiologist annotations.')
    parser.add_argument('predictions_path',
                        help='path to csv file containing predictions.')
    args = parser.parse_args()

    scores = evaluate(args.annotations_path, args.predictions_path)

    print(json.dumps(scores))

if __name__ == '__main__':
    main()
