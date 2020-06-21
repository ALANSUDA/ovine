import styled from 'styled-components'

export const StyledTopBar = styled.div`
  display: flex;
  position: absolute;
  width: 100%;
  height: 50px;
  padding: 0px 15px;
  background-color: #4b4b4b;
  color: #fff;

  ul {
    display: flex;
    margin: 0;
    padding: 0;
  }

  li {
    list-style: none;
  }

  .brand {
    line-height: 50px;
  }

  .left {
    position: absolute;
    height: 100%;
    left: 230px;
  }
  .tool-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-width: 44px;
    padding-top: 2px;
    line-height: 1;
    cursor: pointer;
    .fa {
      display: block;
      font-size: 16px;
    }
    span {
      margin-top: 8px;
      font-size: 12px;
    }
    &:hover {
      background-color: #404040;
    }
  }
`
