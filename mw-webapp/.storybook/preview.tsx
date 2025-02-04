import React from "react";
import type {Preview} from "@storybook/react";
import {ThemeSwitcher} from "../src/logic/themeSwitcher/ThemeSwitcher";
import {ThemeWorker} from '../src/utils/ThemeWorker';

ThemeWorker.loadTheme();

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story, context) => {
      if (context.viewMode === "story") {
        return (
          <>
            <div style={{ position: "absolute", top: "10px", right: "10px" }}>
              <ThemeSwitcher />
            </div>
            <Story />
          </>
        );
      } else {
        return <Story />;
      }
    },
  ]
};

export default preview;
