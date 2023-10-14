import Vue from 'vue';
import dayjs from 'dayjs';
import RelativeTime from 'dayjs/plugin/relativeTime';
import AdvancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(RelativeTime);
dayjs.extend(AdvancedFormat);

export default function install() {
  Object.defineProperties(Vue.prototype, {
    $dayjs: {
      get() {
        return dayjs;
      },
    },
  });

  Vue.dayjs = dayjs;

  Vue.filter('dayjs', (...args) => {
    args = Array.prototype.slice.call(args);
    const input = args.shift();
    let date;

    if (Array.isArray(input) && typeof input[0] === 'string') {
      // If input is array, assume we're being passed a format pattern to parse against.
      // Format pattern will accept an array of potential formats to parse against.
      // Date string should be at [0], format pattern(s) should be at [1]
      date = dayjs(input[0], input[1], true);
    } else if (typeof input === 'number') {
      if (input.toString().length < 12) {
        // If input is an integer with fewer than 12 digits, assume Unix seconds...
        date = dayjs.unix(input);
      } else {
        // ...otherwise, assume milliseconds.
        date = dayjs(input);
      }
    } else {
      // Otherwise, throw the input at dayjs and see what happens...
      date = dayjs(input);
    }

    if (!input || !date.isValid()) {
      // Log a warning if dayjs couldn't reconcile the input. Better than throwing an error?
      console.warn('Could not build a valid `dayjs` object from input.');
      return input;
    }

    function parse(...args) {
      args = Array.prototype.slice.call(args);
      const method = args.shift();

      switch (method) {
        case 'add': {
          /*
           * Mutates the original dayjs by adding time.
           * https://day.js.org/docs/en/manipulate/add
           */

          const addends = args
            .shift()
            .split(',')
            .map(Function.prototype.call, String.prototype.trim);
          const obj = {};

          for (let n = 0; n < addends.length; n++) {
            const addend = addends[n].split(' ');
            obj[addend[1]] = addend[0];
          }
          date.add(obj);
          break;
        }

        case 'subtract': {
          /*
           * Mutates the original dayjs by subtracting time.
           * https://day.js.org/docs/en/manipulate/subtract
           */

          const subtrahends = args
            .shift()
            .split(',')
            .map(Function.prototype.call, String.prototype.trim);
          const obj = {};

          for (let n = 0; n < subtrahends.length; n++) {
            const subtrahend = subtrahends[n].split(' ');
            obj[subtrahend[1]] = subtrahend[0];
          }
          date.subtract(obj);
          break;
        }

        case 'from': {
          /*
           * Display a dayjs in relative time, either from now or from a specified date.
           * https://day.js.org/docs/en/display/from-now
           */

          let from = 'now';
          let removeSuffix = false;

          if (args[0] === 'now') args.shift();
          // If valid, assume it is a date we want the output computed against.
          //if (dayjs(args[0]).isValid()) from = dayjs(args.shift());

          if (args[0] === true) {
            args.shift();
            removeSuffix = true;
          }

          if (from !== 'now') {
            date = date.from(from, removeSuffix);
          } else {
            date = date.fromNow(removeSuffix);
          }
          break;
        }

        case 'diff': {
          /*
           * Mutates the original dayjs by doing a difference with another date.
           * https://day.js.org/docs/en/display/difference
           */

          let referenceTime = dayjs();
          let units = '';
          let float = false;

          if (dayjs(args[0]).isValid()) {
            // If valid, assume it is a date we want the output computed against.
            referenceTime = dayjs(args.shift());
          } else if (args[0] === null || args[0] === 'now') {
            // If null or 'now', remove argument and proceed with default referenceTime.
            args.shift();
          }

          if (args[0]) units = args.shift();

          if (args[0] === true) float = args.shift();

          date = date.diff(referenceTime, units, float);
          break;
        }

        case 'calendar': {
          /*
           * Formats a date with different strings depending on how close
           * to a certain date (today by default) the date is.
           * https://day.js.org/docs/en/display/calendar-time
           */

          let referenceTime = dayjs();
          let formats = {};

          if (dayjs(args[0]).isValid()) {
            // If valid, assume it is a date we want the output computed against.
            referenceTime = dayjs(args.shift());
          } else if (args[0] === null || args[0] === 'now') {
            // If null or 'now', remove argument and proceed with default referenceTime.
            args.shift();
          }

          if (typeof args[0] === 'object') formats = args.shift();

          date = date.calendar(referenceTime, formats);
          break;
        }

        case 'utc': {
          /*
           * Mutates the original dayjs by converting to UTC
           * https://day.js.org/docs/en/manipulate/utc
           */
          date.utc();
          break;
        }

        case 'timezone': {
          /*
           * Mutates the original dayjs by converting to a new timezone.
           * https://day.js.org/docs/en/plugin/timezone
           */
          date.tz(args.shift());
          break;
        }

        default: {
          /*
           * Formats a date by taking a string of tokens and replacing
           * them with their corresponding values.
           * https://day.js.org/docs/en/display/format
           */

          const format = method;
          date = date.format(format);
        }
      }

      if (args.length) parse.apply(parse, args);
    }

    parse.apply(parse, args);

    return date;
  });

  Vue.filter('duration', (...args) => {
    /*
     * Basic pass-through filter for leveraging dayjs's ability
     * to manipulate and display durations.
     * https://day.js.org/docs/en/plugin/duration
     */
    args = Array.prototype.slice.call(args);
    const input = args.shift();
    const method = args.shift();

    function createDuration(time) {
      if (!Array.isArray(time)) time = [time];
      const result = dayjs.duration(...time);
      if (!result.isValid()) console.warn('Could not build a valid `duration` object from input.');
      return result;
    }
    let duration = createDuration(input);

    if (method === 'add' || method === 'subtract') {
      // Generates a duration object and either adds or subtracts it
      // from our original duration.
      const durationChange = createDuration(args);
      duration[method](durationChange);
    } else if (duration && duration[method]) {
      // This gives a full proxy to dayjs.duration functions.
      duration = duration[method](...args);
    }

    return duration;
  });
}
