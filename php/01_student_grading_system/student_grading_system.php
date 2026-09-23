<?php
//Part 1. Screenshots 1, 2, 3 below show three output versions for 1a and 1b with different inputs. Screenshot 4 shows the output for 1c.

// 1a. Takes three exam scores as input and calculates the arithmetic average.
$s1 = 87;
$s2 = 93;
$s3 = 30;
$avg = (($s1 + $s2 + $s3) / 3); // Arithmetic average equation.
echo "Average: " . round($avg, 1) . "\n"; // Rounds the result to one decimal place to prevent unnecessarily long numbers and displays it.

// 1b. Calculates the percentage out of 300 total marks (3 exams).
$pct = (($s1 + $s2 + $s3) / 300) * 100;
echo "Percentage: " . round($pct, 1) . "%\n"; // Rounds the result to one decimal place to prevent unnecessarily long numbers and displays it.

$marks = [78, 90, 100, 78, 90]; // Marks for 5 subjects, saved as a list.
$fails = 0; // New ‘fail' counter for subjects scored below 50.
foreach ($marks as $mark) { // Traverse array values.
    if ($mark < 50) { $fails++; } // Count as a fail if below 50 (increase ‘fail’ counter by 1)
}

if ($fails > 2) { // More than 2 fails triggers probation warning
    echo "Student is placed on academic probation.\n";
} elseif ($fails == 1) { // Exactly one fail - flagging
    echo "Student should pay attention: one subject failed.\n";
} else { // 0 fails, or 2 fails (below probation threshold)
    echo "All subjects in good standing.\n";
}

//Part 2. Screenshots 5 below show output for 2a-c.
//Display Pass or Fail based on average (higher or lower than 50).
$students = [
    ["name" => "Nathan", "scores" => [57, 61, 59]],
    ["name" => "Priya",  "scores" => [41, 47, 33]],
    ["name" => "Marcus", "scores" => [72, 81, 76]],
    ["name" => "Hannah", "scores" => [91, 96, 63]],
    ["name" => "Diego",  "scores" => [52, 54, 51]],
];

foreach ($students as $student) { // Loop through each student
    $name = $student["name"];
    [$a, $b, $c] = $student["scores"]; // Unpack their 3 exam scores
    $studentAvg = ($a + $b + $c) / 3;  // Calculate this student's average
    echo "\n$name\n";
    echo "Scores: $a, $b, $c\n";
    echo "Average: $studentAvg\n";
    // 1. Pass or Fail based on average.
    if ($studentAvg >= 50) { echo "Pass\n"; } else { echo "Fail\n"; }
    // 2. Honor Roll: average above 90 AND at least one exam above 95.
    if ($studentAvg > 90 && ($a > 95 || $b > 95 || $c > 95)) {
        echo "Qualifies for Honor Roll\n";
    }
}
?>
