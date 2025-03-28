/* eslint-disable @typescript-eslint/ban-types */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import {
  SelectButtonChangeEvent,
  SelectButtonOptionClickEvent,
} from 'primeng/selectbutton';
import { ObjectUtils } from 'primeng/utils';

export const SELECTBUTTON_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ChipComponent),
  multi: true,
};

@Component({
    selector: 'app-chip',
    imports: [CommonModule, ButtonModule],
    templateUrl: './chip.component.html',
    styleUrl: './chip.component.scss',
    providers: [SELECTBUTTON_VALUE_ACCESSOR],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ChipComponent implements ControlValueAccessor {
  @Input() options: {value: string, label: string}[] | undefined;

  @Input() optionLabel: string | undefined;
  @Input() optionValue: string | undefined;
  @Input() optionDisabled: string | undefined;
  @Input({ transform: booleanAttribute }) unselectable = false;
  @Input({ transform: booleanAttribute }) multiple: boolean | undefined;
  @Input({ transform: booleanAttribute }) allowEmpty = true;
  @Input({ transform: booleanAttribute }) disabled: boolean | undefined;
  @Input() dataKey: string | undefined;
  @Output() onOptionClick: EventEmitter<SelectButtonOptionClickEvent> =
    new EventEmitter<SelectButtonOptionClickEvent>();
  @Output() onChange: EventEmitter<SelectButtonChangeEvent> =
    new EventEmitter<SelectButtonChangeEvent>();

  get equalityKey() {
    return this.optionValue ? undefined : this.dataKey;
  }

  value: any;

  onModelChange: Function = () => {};
  onModelTouched: Function = () => {};
  focusedIndex = 0;

  constructor(public cd: ChangeDetectorRef) {}

  getOptionLabel(option: any) {
    return this.optionLabel
      ? ObjectUtils.resolveFieldData(option, this.optionLabel)
      : option.label != undefined
      ? option.label
      : option;
  }

  getOptionValue(option: any) {
    return this.optionValue
      ? ObjectUtils.resolveFieldData(option, this.optionValue)
      : this.optionLabel || option.value === undefined
      ? option
      : option.value;
  }

  isOptionDisabled(option: any) {
    return this.optionDisabled
      ? ObjectUtils.resolveFieldData(option, this.optionDisabled)
      : option.disabled !== undefined
      ? option.disabled
      : false;
  }

  writeValue(value: any): void {
    this.value = value;
    this.cd.markForCheck();
  }

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }
  setDisabledState(val: boolean): void {
    this.disabled = val;
    this.cd.markForCheck();
  }

  onOptionSelect(event: any, option: any, index: number) {
    const selected = this.isSelected(option);

    if (selected && this.unselectable) {
      return;
    }

    const optionValue = this.getOptionValue(option);
    let newValue;

    if (this.multiple) {
      if (selected)
        newValue = this.value.filter(
          (val: any) => !ObjectUtils.equals(val, optionValue, this.equalityKey)
        );
      else newValue = this.value ? [...this.value, optionValue] : [optionValue];
    } else {
      if (selected && !this.allowEmpty) {
        return;
      }
      newValue = selected ? null : optionValue;
    }

    this.focusedIndex = index;
    this.value = newValue;
    this.onModelChange(this.value);

    this.onChange.emit({
      originalEvent: event,
      value: this.value,
    });

    this.onOptionClick.emit({
      originalEvent: event,
      option: option,
      index: index,
    });
  }

  onFocus(event: Event, index: number) {
    this.focusedIndex = index;
  }

  onBlur() {
    this.onModelTouched();
  }

  removeOption(option: any): void {
    this.value = this.value.filter(
      (val: any) =>
        !ObjectUtils.equals(val, this.getOptionValue(option), this.dataKey)
    );
  }

  isSelected(option: any) {
    let selected = false;
    const optionValue = this.getOptionValue(option);

    if (this.multiple) {
      if (this.value && Array.isArray(this.value)) {
        for (const val of this.value) {
          if (ObjectUtils.equals(val, optionValue, this.dataKey)) {
            selected = true;
            break;
          }
        }
      }
    } else {
      selected = ObjectUtils.equals(
        this.getOptionValue(option),
        this.value,
        this.equalityKey
      );
    }

    return selected;
  }
}
