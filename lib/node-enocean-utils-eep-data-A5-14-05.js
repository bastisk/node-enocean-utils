/* ------------------------------------------------------------------
* node-enocean-utils - node-enocean-utils-eep-data-A5-14-06.js
*
* Copyright (c) 2019, Sebastian Kiepsch, All rights reserved.
* Released under the MIT license
* Date: 2019-06-19
*
* EEP:A5-14-05 (EEP 2.6.7 specification P85)
* - RORG:A5:4BS Telegram
* - FUNC:14:Multi-Func Sensor
* - TYPE:05:Vibration/Tilt, Supply voltage monitor
* ---------------------------------------------------------------- */
'use strict';
const mBuffer = require('./node-enocean-utils-buffer.js');

const EnoceanUtilsEepDataParser= function() {};

EnoceanUtilsEepDataParser.prototype.parse = function(dd_buf) {
	if(dd_buf.length !== 4) {
		return null;
	}

	let db0 = dd_buf.readUInt8(0);
	let db1 = dd_buf.readUInt8(3);

	// Battery
	let battery = db1 / 50;
	battery = battery.toFixed(1);
	let battery_desc = battery + 'V';

	// LRN Bit
	let lrnb = (db1 & 0b00001000) >> 3;
	let lrnb_desc = '';
	if(lrnb === 0) {
		lrnb_desc = 'Teach-in telegram';
	} else if(lrnb === 1) {
		lrnb_desc = 'Data telegram';
	}

	// Vibrations
	let vib = '';
	if(db1 & 0b00000000){
		vib = 'No vibration detected';
	}

	if(db1 & 0b00000010) {
		vib = 'Vibration dected';
	}

	let db1_bin = ('0000000' + db1.toString(2)).slice(-8);
	let values = {
		'SVC': {
			'key'  : 'SVC',
			'field': 'Supply Voltage',
			'value': db0, 
			'hex'  : [mBuffer.convDecToHexString(db1)],
			'desc' : battery_desc
		},
		'VIB': {
			'key'  : 'VIB',
			'field': 'Vibration',
			'value': db1_bin.substr(6, 1),
			'hex'  : [mBuffer.convDecToHexString(db1)],
			'desc' : vib
		},
		'LRNB': {
			'key'  : 'LRNB',
			'field': 'LRN Bit',
			'value': lrnb,
			'hex'  : [mBuffer.convDecToHexString(lrnb)],
			'bin'  : db1_bin.substr(4, 1),
			'desc' : lrnb_desc
		}
	};

	let message = {
		'eep'  : 'A5-14-05',
		'value': {
			'Vibration': vib
		},
		'desc' : vib,
		'learn': lrnb ? false : true
	};

	let parsed = {
		'field'    : 'Data_DL',
		'message'  : message,
		'hex'      : mBuffer.convBufferToHexString(dd_buf),
		'buffer'   : dd_buf,
		'values'   : values,
		'structure': [values['SVC'], values['LRNB'], values['VIB']]
	};
	return parsed;
};

module.exports = new EnoceanUtilsEepDataParser();
