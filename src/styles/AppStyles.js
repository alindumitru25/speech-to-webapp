import React from "react";
import styled, { keyframes } from "styled-components";
import backgroundImage from "../images/background.jpg";
import { slideInUp } from "react-animations";
import refreshIcon from "../images/refresh.svg";

export const StyledWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center center;
  flex-direction: column;
`;

export const StyledRecorderWrapper = styled.div`
  ${({ activated }) =>
    activated ? "position: static;" : "position: absolute;"};
  ${({ activated }) => (activated ? "bottom: 0" : "bottom: 50%")};
  ${({ activated }) =>
    activated ? "margin-bottom: 80px" : "margin-bottom: -70px;"};
  ${({ activated }) => (activated ? "margin-top: 30px" : "")};
  width: 100%;
  height: 170px;

  transition: bottom 1s;
`;

export const StyledComponent1 = styled.img``;

export const StyledComponent1Wrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  margin-top: auto;
  justify-content: center;
`;

const slideInUpAnimation = keyframes`${slideInUp}`;

export const StyledTranscribedText = styled.div`
  position: absolute;
  top: -30px;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  animation: 1s ${slideInUpAnimation};
`;

export const StyledWrapperRecorderInner = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

export const StyledAceWrapper = styled.div`
  display: flex;
  height: 100%;
`;

export const StyledVisualizerWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  flex: 1;
  box-sizing: border-box;
  padding: 40px;
  animation: 1s ${slideInUpAnimation};
`;

export const StyledVisualizerContainer = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  box-sizing: border-box;
  border-radius: 4px;
  width: 100%;
  background: white;
  max-width: 1600px;
`;

export const LoadingWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 99;

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledWindowWrapper = styled.div`
  flex: 1;
  height: 100%;

  iframe {
    border: none;
  }
`;

export const StyledRefreshWrapper = styled.div`
  position: absolute;
  bottom: -15px;
  right: 15px;
  width: 30px;
  height: 30px;
  background: white;
  border-radius: 30px;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  cursor: pointer;
  margin-left: -15px;
`;

const RefreshIcon = ({ className }) => (
  <img src={refreshIcon} className={className} alt="refresh" />
);

export const StyledRefreshIcon = styled(RefreshIcon)`
  width: 30px;
`;
