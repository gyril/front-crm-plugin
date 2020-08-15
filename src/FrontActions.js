import React from 'react';
import { useStoreState } from './Store';

export const FrontLink = (props) => {
  const { frontContext } = useStoreState();
  const { openUrl } = frontContext;

  return (
    <a onClick={(e) => {e.preventDefault(); openUrl(props.href);}} href={props.href}>
      {props.label}
    </a>
  );
};

export const FrontCompose = (props) => {
  const { frontContext } = useStoreState();
  const { createDraft } = frontContext;

  return (
    <button className="front-compose" onClick={() => createDraft({to: [props.to]})}>{props.label}</button>
  );
};
