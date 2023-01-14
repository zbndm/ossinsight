WITH RECURSIVE seq(idx, current_period_day, last_period_day) AS (
      SELECT
        1 AS idx,
        CURRENT_DATE() AS current_period_day,
        DATE_SUB(CURRENT_DATE(), INTERVAL 28 day) AS last_period_day
      UNION ALL
      SELECT
        idx + 1 AS idx,
        DATE_SUB(CURRENT_DATE(), INTERVAL idx + 1 day) AS current_period_day,
        DATE_SUB(CURRENT_DATE(), INTERVAL idx + 1 + 28 day) AS last_period_day
      FROM seq
      WHERE idx < 28
), group_by_day AS (
    SELECT
        day_offset % 28 + 1 AS idx,
        day_offset DIV 28 AS period,
        day,
        commits
    FROM (
        SELECT
            (DATEDIFF(CURRENT_DATE(), day)) AS day_offset,
            day,
            commits
        FROM (
            SELECT
                DATE_FORMAT(created_at, '%Y-%m-%d') AS day,
                SUM(push_distinct_size) AS commits
            FROM
                github_events ge
            WHERE
                type = 'PushEvent'
                AND repo_id = 41986369
                AND created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY)
            GROUP BY day
            ORDER BY day
        ) sub
    ) sub2
), last_28_days AS (
    SELECT idx, day, commits
    FROM group_by_day
    WHERE period = 0
), last_2nd_28_days AS (
    SELECT idx, day, commits
    FROM group_by_day
    WHERE period = 1
), last_28_days_total AS (
    SELECT SUM(commits) AS total FROM last_28_days
), last_2nd_28_days_total AS (
    SELECT SUM(commits) AS total FROM last_2nd_28_days
)
SELECT
    s.idx AS idx,
    s.current_period_day AS current_period_day,
    IFNULL(cp.commits, 0) AS current_period_day_commits,
    IFNULL(cpt.total, 0) AS current_period_commits,
    s.last_period_day AS last_period_day,
    IFNULL(lp.commits, 0) AS last_period_day_commits,
    IFNULL(lpt.total, 0) AS last_period_commits
FROM seq s
LEFT JOIN last_28_days cp ON s.idx = cp.idx
LEFT JOIN last_2nd_28_days lp ON s.idx = lp.idx
JOIN last_28_days_total cpt ON 1 = 1
JOIN last_2nd_28_days_total lpt ON 1 = 1
ORDER BY idx
;