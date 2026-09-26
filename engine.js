/* GravelMath engine - honest gravel math. UMD: browser global + Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GravelMath = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var up = function (x) { return Math.ceil(x - 1e-9); };

  // Crushed stone: ~1.4 tons per cubic yard, and it compacts about 20% -
  // the depth you rake is not the depth you keep.
  var TONS_PER_YARD = 1.4;
  var COMPACTION = 1.2;

  // Depth by job: the number everyone under-orders.
  var DEPTH_BY_USE = { path: 2, patio: 4, driveway: 6 };

  function cubicYards(areaSqFt, depthIn) {
    return areaSqFt * depthIn / 12 / 27;
  }

  function tonsNeeded(areaSqFt, depthIn) {
    return cubicYards(areaSqFt, depthIn) * COMPACTION * TONS_PER_YARD;
  }

  // Suppliers sell by the half ton.
  function orderTons(areaSqFt, depthIn) {
    var t = tonsNeeded(areaSqFt, depthIn);
    return Math.max(0.5, Math.ceil((t - 1e-9) * 2) / 2);
  }

  // Bags are 0.5 cu ft, about 50 lb each, 54 to the yard before compaction.
  function bagsNeeded(areaSqFt, depthIn) {
    return up(areaSqFt * depthIn / 12 * COMPACTION / 0.5);
  }

  function compare(areaSqFt, depthIn, opts) {
    opts = opts || {};
    var bagPrice = opts.bagPrice != null ? opts.bagPrice : 5;
    var tonPrice = opts.tonPrice != null ? opts.tonPrice : 45;
    var delivery = opts.delivery != null ? opts.delivery : 50;

    var tons = orderTons(areaSqFt, depthIn);
    var bags = bagsNeeded(areaSqFt, depthIn);
    var bagTotal = Math.round(bags * bagPrice * 100) / 100;
    var bulkTotal = Math.round((tons * tonPrice + delivery) * 100) / 100;
    var winner = bagTotal <= bulkTotal ? 'bags' : 'bulk';
    return {
      yards: Math.round(cubicYards(areaSqFt, depthIn) * 100) / 100,
      compactedYards: Math.round(cubicYards(areaSqFt, depthIn) * COMPACTION * 100) / 100,
      tons: tons, bags: bags,
      bagTotal: bagTotal, bulkTotal: bulkTotal,
      winner: winner, savings: Math.round(Math.abs(bagTotal - bulkTotal) * 100) / 100
    };
  }

  function advice(cmp, use) {
    if (use === 'driveway') {
      return 'Driveways are two jobs: 4 inches of coarse base, 2 inches of finish stone, compacted between. Skip the compaction and the ruts arrive with the first wet winter.';
    }
    if (cmp.winner === 'bags' && cmp.bags <= 20) {
      return 'At this size bags honestly win - no delivery fee, no pile on the lawn, done in one trunk run. Lay fabric first or you are weeding the path by July.';
    }
    if (cmp.bags > 100) {
      return 'Over 100 bags is a truck, not a trunk. The bulk pile costs less than half and the wheelbarrow work is the same either way - lay fabric before the first stone drops.';
    }
    return 'Lay landscape fabric under paths and patios - gravel on bare soil migrates down and the weeds come up, and you re-buy both every two years.';
  }

  return {
    TONS_PER_YARD: TONS_PER_YARD, COMPACTION: COMPACTION, DEPTH_BY_USE: DEPTH_BY_USE,
    cubicYards: cubicYards, tonsNeeded: tonsNeeded, orderTons: orderTons,
    bagsNeeded: bagsNeeded, compare: compare, advice: advice
  };
});
