// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {renderWithIntl, fireEvent} from '@test/intl-test-helper';

import ChannelInfoForm from './channel_info_form';

describe('ChannelInfoForm', () => {
    const baseProps = {
        testID: 'edit_channel_info',
        channelType: 'O',
        enableRightButton: jest.fn(),
        saving: false,
        editing: false,
        error: '',
        displayName: 'orig_display_name',
        onDisplayNameChange: jest.fn(),
        purpose: 'orig_purpose',
        onPurposeChange: jest.fn(),
        header: 'orig_header',
        onHeaderChange: jest.fn(),
        onTypeChange: jest.fn(),
        oldDisplayName: 'orig_display_name',
        oldHeader: 'orig_header',
        oldPurpose: 'orig_purpose',
    };

    test('create - should match snapshot', () => {
        const {queryByText, toJSON} = renderWithIntl(
            <ChannelInfoForm {...baseProps}/>,
        );
        expect(queryByText('Public Channel')).toBeTruthy();
        expect(queryByText('Private Channel')).toBeTruthy();
        expect(toJSON()).toMatchSnapshot();
    });

    test('edit - should match snapshot', () => {
        const {queryByText, toJSON} = renderWithIntl(
            <ChannelInfoForm
                {...baseProps}
                editing={true}
            />,
        );
        expect(queryByText('Public Channel')).toBeFalsy();
        expect(queryByText('Private Channel')).toBeFalsy();
        expect(toJSON()).toMatchSnapshot();
    });

    test('create - error displayed', () => {
        const {queryByText} = renderWithIntl(
            <ChannelInfoForm
                {...baseProps}
                error='this is an error'
            />,
        );
        expect(queryByText('this is an error')).toBeTruthy();
    });

    test('edit - button enabling and disabling', () => {
        const {displayName, onDisplayNameChange, enableRightButton, oldDisplayName} = baseProps;
        const {getByTestId} = renderWithIntl(
            <ChannelInfoForm
                {...baseProps}
                editing={true}
            />,
        );

        const displayInput = getByTestId('edit_channel_info.displayname.input');

        // right button disabled
        expect(enableRightButton).not.toHaveBeenCalled();

        // displayName value initialized with value from channel
        expect(displayInput.props.value).toEqual(oldDisplayName);

        // change display name value. calls enableRightButton with true
        fireEvent(displayInput, 'onChangeText', 'new display name');
        expect(onDisplayNameChange).toHaveBeenCalledWith('new display name');
        expect(enableRightButton.mock.calls[0][0]).toEqual(true);

        // change display name back to original. call enableRightButton again
        // with false because values are the same as original values
        fireEvent(displayInput, 'onChangeText', displayName);
        expect(enableRightButton.mock.calls[1][0]).toEqual(false);

        fireEvent(displayInput, 'onChangeText', displayName + 'e');
        expect(enableRightButton.mock.calls[2][0]).toEqual(true);
    });
});